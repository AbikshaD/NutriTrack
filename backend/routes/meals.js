import express from 'express';
import { protect } from '../middleware/auth.js';
import Meal from '../models/Meal.js';

const router = express.Router();

// Add meal
router.post('/', protect, async (req, res) => {
  try {
    const { foodName, quantity, calories, protein, carbs, fat, mealType } = req.body;

    const meal = await Meal.create({
      userId: req.user._id,
      foodName,
      quantity,
      calories,
      protein,
      carbs,
      fat,
      mealType,
      date: new Date() // Ensure date is set
    });

    res.status(201).json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's meals for a specific date
router.get('/', protect, async (req, res) => {
  try {
    const { date } = req.query;
    let query = { userId: req.user._id };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const meals = await Meal.find(query).sort({ createdAt: -1 });
    res.json(meals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get weekly summary - FIXED VERSION
router.get('/weekly', protect, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // Last 7 days including today
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    console.log('Fetching weekly data from:', startDate, 'to:', endDate);

    const meals = await Meal.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { 
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$date" 
            }
          },
          totalCalories: { $sum: "$calories" },
          totalProtein: { $sum: "$protein" },
          totalCarbs: { $sum: "$carbs" },
          totalFat: { $sum: "$fat" },
          mealCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    console.log('Weekly aggregation result:', meals);

    // Fill in missing days with zero values
    const filledData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existingDay = meals.find(day => day._id === dateStr);
      
      if (existingDay) {
        filledData.push(existingDay);
      } else {
        filledData.push({
          _id: dateStr,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          mealCount: 0
        });
      }
    }

    res.json(filledData);
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    res.status(500).json({ 
      message: 'Error fetching weekly data',
      error: error.message 
    });
  }
});

export default router;