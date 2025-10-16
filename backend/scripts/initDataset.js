import mongoose from 'mongoose';
import FoodDataset from '../models/FoodDataset.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleFoods = [
  // Fruits
  { foodName: 'apple', category: 'fruit', calories: 52, protein: 0, carbs: 14, fat: 0 },
  { foodName: 'banana', category: 'fruit', calories: 89, protein: 1, carbs: 23, fat: 0 },
  { foodName: 'orange', category: 'fruit', calories: 47, protein: 1, carbs: 12, fat: 0 },
  { foodName: 'grapes', category: 'fruit', calories: 69, protein: 1, carbs: 18, fat: 0 },
  
  // Vegetables
  { foodName: 'broccoli', category: 'vegetable', calories: 34, protein: 3, carbs: 7, fat: 0 },
  { foodName: 'carrot', category: 'vegetable', calories: 41, protein: 1, carbs: 10, fat: 0 },
  { foodName: 'spinach', category: 'vegetable', calories: 23, protein: 3, carbs: 4, fat: 0 },
  
  // Proteins
  { foodName: 'chicken breast', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { foodName: 'salmon', category: 'protein', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { foodName: 'eggs', category: 'protein', calories: 155, protein: 13, carbs: 1, fat: 11 },
  { foodName: 'tofu', category: 'protein', calories: 76, protein: 8, carbs: 2, fat: 5 },
  
  // Grains
  { foodName: 'white rice', category: 'grain', calories: 130, protein: 3, carbs: 28, fat: 0 },
  { foodName: 'brown rice', category: 'grain', calories: 112, protein: 2, carbs: 23, fat: 1 },
  { foodName: 'pasta', category: 'grain', calories: 131, protein: 5, carbs: 25, fat: 1 },
  { foodName: 'bread', category: 'grain', calories: 265, protein: 9, carbs: 49, fat: 3 },
  
  // Dairy
  { foodName: 'milk', category: 'dairy', calories: 42, protein: 3, carbs: 5, fat: 1 },
  { foodName: 'cheese', category: 'dairy', calories: 402, protein: 25, carbs: 1, fat: 33 },
  { foodName: 'yogurt', category: 'dairy', calories: 59, protein: 10, carbs: 4, fat: 0 },
];

async function initDataset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await FoodDataset.deleteMany({});
    console.log('Cleared existing food dataset');

    // Insert sample data
    await FoodDataset.insertMany(sampleFoods);
    console.log(`Added ${sampleFoods.length} sample foods to dataset`);

    console.log('Dataset initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing dataset:', error);
    process.exit(1);
  }
}

initDataset();