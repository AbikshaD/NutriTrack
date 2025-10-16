import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';
import caloriePredictor from '../services/caloriePredictor.js';
import FoodDataset from '../models/FoodDataset.js';

const router = express.Router();

// Initialize ML model when server starts
caloriePredictor.trainModel();

// Predict calories from food name using ML
router.post('/calories', protect, async (req, res) => {
  try {
    const { foodName, quantity = 100 } = req.body;

    if (!foodName) {
      return res.status(400).json({ message: 'Food name is required' });
    }

    console.log(`Predicting calories for: ${foodName}, Quantity: ${quantity}`);

    // Use ML model to predict
    const prediction = await caloriePredictor.predictCalories(foodName, quantity);

    res.json({
      foodName,
      quantity: `${quantity}g`,
      ...prediction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      message: 'Error predicting nutrition data',
      error: error.message 
    });
  }
});

// Add food to dataset (for training)
router.post('/dataset', protect, async (req, res) => {
  try {
    const { foodName, category, calories, protein, carbs, fat, servingSize } = req.body;

    const foodItem = await FoodDataset.create({
      foodName: foodName.toLowerCase(),
      category,
      calories: parseInt(calories),
      protein: parseInt(protein),
      carbs: parseInt(carbs),
      fat: parseInt(fat),
      servingSize: servingSize || '100g'
    });

    // Retrain model with new data
    await caloriePredictor.trainModel();

    res.json({
      message: 'Food added to dataset and model retrained',
      foodItem
    });

  } catch (error) {
    console.error('Error adding to dataset:', error);
    res.status(500).json({ 
      message: 'Error adding food to dataset',
      error: error.message 
    });
  }
});

// Get dataset statistics
router.get('/dataset/stats', protect, async (req, res) => {
  try {
    const totalFoods = await FoodDataset.countDocuments();
    const categories = await FoodDataset.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgCalories: { $avg: '$calories' }
        }
      }
    ]);

    res.json({
      totalFoods,
      categories,
      modelTrained: caloriePredictor.isTrained,
      trainingSamples: caloriePredictor.trainingData?.length || 0
    });

  } catch (error) {
    console.error('Error getting dataset stats:', error);
    res.status(500).json({ 
      message: 'Error getting dataset statistics',
      error: error.message 
    });
  }
});

// Search foods in dataset
router.get('/dataset/search', protect, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const foods = await FoodDataset.find({
      foodName: { $regex: query, $options: 'i' }
    }).limit(10);

    res.json(foods);

  } catch (error) {
    console.error('Error searching dataset:', error);
    res.status(500).json({ 
      message: 'Error searching food dataset',
      error: error.message 
    });
  }
});

export default router;