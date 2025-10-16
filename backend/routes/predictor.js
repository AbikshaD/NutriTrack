import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Predict calories from food name
router.post('/calories', protect, async (req, res) => {
  try {
    const { foodName, quantity } = req.body;

    // Using Nutritionix API (you'll need to sign up for free API keys)
    // For demo purposes, we'll use a mock response
    const mockNutritionData = {
      food_name: foodName,
      serving_qty: 1,
      serving_unit: "piece",
      nf_calories: Math.floor(Math.random() * 300) + 50,
      nf_protein: Math.floor(Math.random() * 20) + 1,
      nf_total_carbohydrate: Math.floor(Math.random() * 40) + 5,
      nf_total_fat: Math.floor(Math.random() * 15) + 1
    };

    // In production, you would use:
    /*
    const response = await axios.get('https://trackapi.nutritionix.com/v2/search/instant', {
      headers: {
        'x-app-id': process.env.NUTRITION_APP_ID,
        'x-app-key': process.env.NUTRITION_API_KEY
      },
      params: { query: foodName }
    });
    */

    // Calculate based on quantity
    const multiplier = parseFloat(quantity) || 1;
    const nutrition = {
      foodName: mockNutritionData.food_name,
      quantity: `${quantity} piece(s)`,
      calories: Math.round(mockNutritionData.nf_calories * multiplier),
      protein: Math.round(mockNutritionData.nf_protein * multiplier),
      carbs: Math.round(mockNutritionData.nf_total_carbohydrate * multiplier),
      fat: Math.round(mockNutritionData.nf_total_fat * multiplier)
    };

    res.json(nutrition);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: 'Error predicting nutrition data' });
  }
});

export default router;