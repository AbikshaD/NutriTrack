import mongoose from 'mongoose';

const foodDatasetSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  fiber: {
    type: Number,
    default: 0
  },
  sugar: {
    type: Number,
    default: 0
  },
  servingSize: {
    type: String,
    default: '100g'
  }
}, {
  timestamps: true
});

// Create index for faster search
foodDatasetSchema.index({ foodName: 'text', category: 'text' });

export default mongoose.model('FoodDataset', foodDatasetSchema);