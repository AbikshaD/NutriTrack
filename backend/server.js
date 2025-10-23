import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import mealRoutes from './routes/meals.js';
import predictorRoutes from './routes/predictor.js';
import FoodDataset from './models/FoodDataset.js';
import caloriePredictor from './services/caloriePredictor.js';

dotenv.config();

const app = express();

// Fix CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Test route to check if backend is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Initialize sample data if database is empty
async function initializeSampleData() {
  try {
    const foodCount = await FoodDataset.countDocuments();
    if (foodCount === 0) {
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
      
      await FoodDataset.insertMany(sampleFoods);
      console.log('Sample food data initialized with 20 foods');
    } else {
      console.log(`Food dataset already has ${foodCount} items`);
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/predictor', predictorRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nutritrack')
  .then(async () => {
    console.log('MongoDB connected');
    await initializeSampleData();
    await caloriePredictor.trainModel();
  })
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
