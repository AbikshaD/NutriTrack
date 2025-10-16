import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Update personal information
router.put('/personal-info', protect, async (req, res) => {
  try {
    const { name, age, height, weight, gender } = req.body;
    
    console.log('Updating personal info for user:', req.user._id);
    console.log('Data received:', { name, age, height, weight, gender });

    // Validate required fields
    if (!name || !age || !height || !weight || !gender) {
      return res.status(400).json({ 
        message: 'All fields are required: name, age, height, weight, gender' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        personalInfo: { 
          name, 
          age: parseInt(age), 
          height: parseFloat(height), 
          weight: parseFloat(weight), 
          gender 
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Personal info updated successfully');
    res.json({
      message: 'Personal information updated successfully',
      user: user
    });
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({ 
      message: 'Server error while updating personal information',
      error: error.message 
    });
  }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      message: 'Server error while fetching profile',
      error: error.message 
    });
  }
});

// Delete user account
router.delete('/account', protect, async (req, res) => {
  try {
    console.log('Deleting account for user:', req.user._id);

    // First, delete all meals associated with the user
    const Meal = await import('../models/Meal.js');
    await Meal.default.deleteMany({ userId: req.user._id });
    console.log('Deleted user meals');

    // Then delete the user account
    await User.findByIdAndDelete(req.user._id);
    console.log('Deleted user account');

    res.json({ 
      message: 'Account and all associated data deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ 
      message: 'Server error while deleting account',
      error: error.message 
    });
  }
});

export default router;