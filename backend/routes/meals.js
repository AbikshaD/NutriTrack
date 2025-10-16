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
      mealType
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

// Get weekly summary
router.get('/weekly', protect, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const meals = await Meal.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
          },
          totalCalories: { $sum: "$calories" },
          totalProtein: { $sum: "$protein" },
          totalCarbs: { $sum: "$carbs" },
          totalFat: { $sum: "$fat" },
          mealCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    res.json(meals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;