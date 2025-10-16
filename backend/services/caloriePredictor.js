import FoodDataset from '../models/FoodDataset.js';

class CaloriePredictor {
  constructor() {
    this.model = null;
    this.isTrained = false;
    this.trainingData = [];
  }

  // Simple K-Nearest Neighbors implementation for calorie prediction
  async trainModel() {
    try {
      const allFoods = await FoodDataset.find({});
      
      if (allFoods.length < 10) {
        console.log('Not enough data to train model. Using fallback prediction.');
        this.isTrained = false;
        return;
      }

      this.trainingData = allFoods.map(food => ({
        features: this.extractFeatures(food.foodName),
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        food: food
      }));

      this.isTrained = true;
      console.log(`ML Model trained with ${this.trainingData.length} samples`);
    } catch (error) {
      console.error('Error training model:', error);
      this.isTrained = false;
    }
  }

  // Extract features from food name (simple NLP)
  extractFeatures(foodName) {
    const features = [];
    const name = foodName.toLowerCase();
    
    // Food categories
    const categories = {
      fruit: ['apple', 'banana', 'orange', 'berry', 'grape', 'mango', 'pineapple'],
      vegetable: ['broccoli', 'carrot', 'spinach', 'lettuce', 'tomato', 'cucumber'],
      protein: ['chicken', 'beef', 'fish', 'egg', 'tofu', 'pork', 'turkey'],
      grain: ['rice', 'pasta', 'bread', 'oats', 'quinoa', 'wheat'],
      dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
      nut: ['almond', 'walnut', 'peanut', 'cashew', 'pecan']
    };

    // Check categories
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        features.push(1);
      } else {
        features.push(0);
      }
    }

    // Food properties
    features.push(name.includes('fried') ? 1 : 0);
    features.push(name.includes('grilled') ? 1 : 0);
    features.push(name.includes('baked') ? 1 : 0);
    features.push(name.includes('raw') ? 1 : 0);
    features.push(name.includes('sweet') ? 1 : 0);
    features.push(name.includes('spicy') ? 1 : 0);

    // Length of food name (proxy for complexity)
    features.push(Math.min(name.length / 20, 1));

    return features;
  }

  // Calculate similarity between two feature vectors
  calculateSimilarity(features1, features2) {
    if (features1.length !== features2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < features1.length; i++) {
      dotProduct += features1[i] * features2[i];
      norm1 += features1[i] * features1[i];
      norm2 += features2[i] * features2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2) + 1e-8);
  }

  // K-Nearest Neighbors prediction
  async predictCalories(foodName, quantity = 100) {
    try {
      // First, try exact match in database
      const exactMatch = await FoodDataset.findOne({
        foodName: { $regex: new RegExp(foodName, 'i') }
      });

      if (exactMatch) {
        const multiplier = quantity / 100;
        return {
          calories: Math.round(exactMatch.calories * multiplier),
          protein: Math.round(exactMatch.protein * multiplier),
          carbs: Math.round(exactMatch.carbs * multiplier),
          fat: Math.round(exactMatch.fat * multiplier),
          confidence: 1.0,
          method: 'exact_match',
          matchedFood: exactMatch.foodName
        };
      }

      // If no exact match and model is trained, use ML prediction
      if (this.isTrained && this.trainingData.length > 0) {
        const inputFeatures = this.extractFeatures(foodName);
        
        // Find k nearest neighbors
        const k = Math.min(5, this.trainingData.length);
        const similarities = this.trainingData.map((data, index) => ({
          index,
          similarity: this.calculateSimilarity(inputFeatures, data.features)
        }));

        // Sort by similarity
        similarities.sort((a, b) => b.similarity - a.similarity);
        const nearestNeighbors = similarities.slice(0, k);

        // Calculate weighted average
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let totalSimilarity = 0;

        for (const neighbor of nearestNeighbors) {
          const data = this.trainingData[neighbor.index];
          const weight = neighbor.similarity;
          
          totalCalories += data.calories * weight;
          totalProtein += data.protein * weight;
          totalCarbs += data.carbs * weight;
          totalFat += data.fat * weight;
          totalSimilarity += weight;
        }

        if (totalSimilarity > 0) {
          const multiplier = quantity / 100;
          const confidence = Math.min(totalSimilarity / k, 0.8); // Max 80% confidence for ML

          return {
            calories: Math.round((totalCalories / totalSimilarity) * multiplier),
            protein: Math.round((totalProtein / totalSimilarity) * multiplier),
            carbs: Math.round((totalCarbs / totalSimilarity) * multiplier),
            fat: Math.round((totalFat / totalSimilarity) * multiplier),
            confidence: confidence,
            method: 'ml_prediction',
            similarFoods: nearestNeighbors.map(n => this.trainingData[n.index].food.foodName)
          };
        }
      }

      // Fallback: Use category-based averages
      return await this.fallbackPrediction(foodName, quantity);

    } catch (error) {
      console.error('Error in calorie prediction:', error);
      return await this.fallbackPrediction(foodName, quantity);
    }
  }

  // Fallback prediction using category averages
  async fallbackPrediction(foodName, quantity) {
    const name = foodName.toLowerCase();
    let category = 'other';
    let baseCalories = 150;
    let baseProtein = 10;
    let baseCarbs = 20;
    let baseFat = 5;

    // Simple category detection
    if (name.includes('chicken') || name.includes('beef') || name.includes('fish')) {
      category = 'protein';
      baseCalories = 200; baseProtein = 25; baseCarbs = 0; baseFat = 10;
    } else if (name.includes('rice') || name.includes('pasta') || name.includes('bread')) {
      category = 'grain';
      baseCalories = 130; baseProtein = 3; baseCarbs = 28; baseFat = 1;
    } else if (name.includes('apple') || name.includes('banana') || name.includes('orange')) {
      category = 'fruit';
      baseCalories = 60; baseProtein = 1; baseCarbs = 15; baseFat = 0;
    } else if (name.includes('broccoli') || name.includes('carrot') || name.includes('spinach')) {
      category = 'vegetable';
      baseCalories = 35; baseProtein = 2; baseCarbs = 7; baseFat = 0;
    }

    const multiplier = quantity / 100;

    return {
      calories: Math.round(baseCalories * multiplier),
      protein: Math.round(baseProtein * multiplier),
      carbs: Math.round(baseCarbs * multiplier),
      fat: Math.round(baseFat * multiplier),
      confidence: 0.3,
      method: 'fallback_category',
      category: category
    };
  }
}

// Create singleton instance
export default new CaloriePredictor();