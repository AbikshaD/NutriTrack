import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FoodDataset from '../models/FoodDataset.js';

dotenv.config();

// --- EXPANDED SAMPLE FOODS DATASET ---
const sampleFoods = [
  // 🥭 Fruits
  { foodName: 'apple', category: 'fruit', calories: 52, protein: 0, carbs: 14, fat: 0 },
  { foodName: 'banana', category: 'fruit', calories: 89, protein: 1, carbs: 23, fat: 0 },
  { foodName: 'orange', category: 'fruit', calories: 47, protein: 1, carbs: 12, fat: 0 },
  { foodName: 'grapes', category: 'fruit', calories: 69, protein: 1, carbs: 18, fat: 0 },
  { foodName: 'strawberries', category: 'fruit', calories: 32, protein: 1, carbs: 8, fat: 0 },
  { foodName: 'blueberries', category: 'fruit', calories: 57, protein: 1, carbs: 14, fat: 0 },
  { foodName: 'mango', category: 'fruit', calories: 60, protein: 1, carbs: 15, fat: 0 },
  { foodName: 'pineapple', category: 'fruit', calories: 50, protein: 1, carbs: 13, fat: 0 },
  { foodName: 'watermelon', category: 'fruit', calories: 30, protein: 1, carbs: 8, fat: 0 },
  { foodName: 'avocado', category: 'fruit', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { foodName: 'papaya', category: 'fruit', calories: 43, protein: 0, carbs: 11, fat: 0 },
  { foodName: 'pomegranate', category: 'fruit', calories: 83, protein: 1, carbs: 19, fat: 1 },
  { foodName: 'pear', category: 'fruit', calories: 57, protein: 0, carbs: 15, fat: 0 },
  { foodName: 'kiwi', category: 'fruit', calories: 41, protein: 1, carbs: 10, fat: 0 },
  { foodName: 'guava', category: 'fruit', calories: 68, protein: 3, carbs: 14, fat: 1 },

  // 🥕 Vegetables
  { foodName: 'broccoli', category: 'vegetable', calories: 34, protein: 3, carbs: 7, fat: 0 },
  { foodName: 'carrot', category: 'vegetable', calories: 41, protein: 1, carbs: 10, fat: 0 },
  { foodName: 'spinach', category: 'vegetable', calories: 23, protein: 3, carbs: 4, fat: 0 },
  { foodName: 'potato', category: 'vegetable', calories: 77, protein: 2, carbs: 17, fat: 0 },
  { foodName: 'sweet potato', category: 'vegetable', calories: 86, protein: 2, carbs: 20, fat: 0 },
  { foodName: 'tomato', category: 'vegetable', calories: 18, protein: 1, carbs: 4, fat: 0 },
  { foodName: 'cucumber', category: 'vegetable', calories: 15, protein: 1, carbs: 4, fat: 0 },
  { foodName: 'bell pepper', category: 'vegetable', calories: 31, protein: 1, carbs: 6, fat: 0 },
  { foodName: 'onion', category: 'vegetable', calories: 40, protein: 1, carbs: 9, fat: 0 },
  { foodName: 'garlic', category: 'vegetable', calories: 149, protein: 6, carbs: 33, fat: 0 },
  { foodName: 'cabbage', category: 'vegetable', calories: 25, protein: 1, carbs: 6, fat: 0 },
  { foodName: 'cauliflower', category: 'vegetable', calories: 25, protein: 2, carbs: 5, fat: 0 },
  { foodName: 'brinjal', category: 'vegetable', calories: 25, protein: 1, carbs: 6, fat: 0 },
  { foodName: 'beans', category: 'vegetable', calories: 31, protein: 2, carbs: 7, fat: 0 },
  { foodName: 'peas', category: 'vegetable', calories: 81, protein: 5, carbs: 14, fat: 0 },

  // 🍗 Protein Sources
  { foodName: 'chicken breast', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { foodName: 'salmon', category: 'protein', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { foodName: 'egg', category: 'protein', calories: 155, protein: 13, carbs: 1, fat: 11 },
  { foodName: 'tofu', category: 'protein', calories: 76, protein: 8, carbs: 2, fat: 5 },
  { foodName: 'beef steak', category: 'protein', calories: 271, protein: 25, carbs: 0, fat: 19 },
  { foodName: 'pork chop', category: 'protein', calories: 242, protein: 27, carbs: 0, fat: 14 },
  { foodName: 'turkey breast', category: 'protein', calories: 135, protein: 30, carbs: 0, fat: 1 },
  { foodName: 'tuna', category: 'protein', calories: 132, protein: 29, carbs: 0, fat: 1 },
  { foodName: 'shrimp', category: 'protein', calories: 85, protein: 20, carbs: 0, fat: 1 },
  { foodName: 'lentils', category: 'protein', calories: 116, protein: 9, carbs: 20, fat: 0 },
  { foodName: 'black beans', category: 'protein', calories: 132, protein: 9, carbs: 23, fat: 1 },
  { foodName: 'chickpeas', category: 'protein', calories: 164, protein: 9, carbs: 27, fat: 3 },
  { foodName: 'paneer', category: 'protein', calories: 296, protein: 18, carbs: 6, fat: 23 },
  { foodName: 'soy chunks', category: 'protein', calories: 345, protein: 52, carbs: 33, fat: 0 },

  // 🌾 Grains & Carbs
  { foodName: 'white rice', category: 'grain', calories: 130, protein: 3, carbs: 28, fat: 0 },
  { foodName: 'brown rice', category: 'grain', calories: 112, protein: 2, carbs: 23, fat: 1 },
  { foodName: 'pasta', category: 'grain', calories: 131, protein: 5, carbs: 25, fat: 1 },
  { foodName: 'bread', category: 'grain', calories: 265, protein: 9, carbs: 49, fat: 3 },
  { foodName: 'oats', category: 'grain', calories: 389, protein: 17, carbs: 66, fat: 7 },
  { foodName: 'quinoa', category: 'grain', calories: 120, protein: 4, carbs: 21, fat: 2 },
  { foodName: 'corn', category: 'grain', calories: 86, protein: 3, carbs: 19, fat: 1 },
  { foodName: 'idli', category: 'grain', calories: 58, protein: 2, carbs: 13, fat: 0 },
  { foodName: 'dosa', category: 'grain', calories: 133, protein: 2, carbs: 17, fat: 5 },
  { foodName: 'chapati', category: 'grain', calories: 120, protein: 3, carbs: 18, fat: 4 },
  { foodName: 'upma', category: 'grain', calories: 150, protein: 3, carbs: 25, fat: 5 },

  // 🥛 Dairy & Alternatives
  { foodName: 'milk', category: 'dairy', calories: 42, protein: 3, carbs: 5, fat: 1 },
  { foodName: 'cheese', category: 'dairy', calories: 402, protein: 25, carbs: 1, fat: 33 },
  { foodName: 'yogurt', category: 'dairy', calories: 59, protein: 10, carbs: 4, fat: 0 },
  { foodName: 'butter', category: 'dairy', calories: 717, protein: 1, carbs: 0, fat: 81 },
  { foodName: 'almond milk', category: 'dairy', calories: 17, protein: 1, carbs: 1, fat: 1 },
  { foodName: 'soy milk', category: 'dairy', calories: 54, protein: 3, carbs: 6, fat: 2 },
  { foodName: 'curd', category: 'dairy', calories: 98, protein: 11, carbs: 4, fat: 4 },

  // 🌰 Nuts & Seeds
  { foodName: 'almonds', category: 'nuts', calories: 579, protein: 21, carbs: 22, fat: 50 },
  { foodName: 'walnuts', category: 'nuts', calories: 654, protein: 15, carbs: 14, fat: 65 },
  { foodName: 'peanuts', category: 'nuts', calories: 567, protein: 26, carbs: 16, fat: 49 },
  { foodName: 'chia seeds', category: 'nuts', calories: 486, protein: 17, carbs: 42, fat: 31 },
  { foodName: 'flax seeds', category: 'nuts', calories: 534, protein: 18, carbs: 29, fat: 42 },
  { foodName: 'cashews', category: 'nuts', calories: 553, protein: 18, carbs: 30, fat: 44 },
  { foodName: 'pumpkin seeds', category: 'nuts', calories: 559, protein: 30, carbs: 11, fat: 49 },

  // 🍕 Processed / Common Dishes
  { foodName: 'pizza', category: 'processed', calories: 266, protein: 11, carbs: 33, fat: 10 },
  { foodName: 'burger', category: 'processed', calories: 295, protein: 17, carbs: 24, fat: 15 },
  { foodName: 'french fries', category: 'processed', calories: 312, protein: 4, carbs: 41, fat: 15 },
  { foodName: 'chocolate', category: 'processed', calories: 546, protein: 5, carbs: 61, fat: 31 },
  { foodName: 'ice cream', category: 'processed', calories: 207, protein: 4, carbs: 24, fat: 11 },
  { foodName: 'noodles', category: 'processed', calories: 138, protein: 3, carbs: 25, fat: 3 },
  { foodName: 'samosa', category: 'processed', calories: 262, protein: 4, carbs: 33, fat: 13 },
  { foodName: 'pasta (cooked)', category: 'processed', calories: 157, protein: 6, carbs: 30, fat: 2 },
];

// --- INITIALIZER FUNCTION ---
async function initDataset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const deleteResult = await FoodDataset.deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing items`);

    const result = await FoodDataset.insertMany(sampleFoods);
    console.log(`✅ Inserted ${result.length} new food items`);

    const categories = await FoodDataset.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgCalories: { $avg: '$calories' }
        }
      }
    ]);

    console.log('\n📊 Dataset Statistics:');
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} items, avg ${Math.round(cat.avgCalories)} calories`);
    });

    console.log('\n🎯 Dataset initialized successfully!');
  } catch (err) {
    console.error('❌ Error initializing dataset:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
    process.exit(0);
  }
}

// Graceful termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Script terminated by user');
  await mongoose.connection.close();
  process.exit(0);
});

initDataset();
