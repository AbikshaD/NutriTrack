import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './PersonalInfo.css'; // Optional CSS file for styling

const PersonalInfo = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name || !formData.age || !formData.height || !formData.weight || !formData.gender) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.age < 1 || formData.age > 120) {
      setError('Please enter a valid age (1-120)');
      setLoading(false);
      return;
    }

    if (formData.height < 50 || formData.height > 250) {
      setError('Please enter a valid height (50-250 cm)');
      setLoading(false);
      return;
    }

    if (formData.weight < 20 || formData.weight > 300) {
      setError('Please enter a valid weight (20-300 kg)');
      setLoading(false);
      return;
    }

    try {
      await userAPI.updatePersonalInfo({
        name: formData.name,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        gender: formData.gender
      });
      
      // Navigate to home page after successful submission
      navigate('/home');
    } catch (error) {
      console.error('Error updating personal info:', error);
      setError('Failed to save personal information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If user is not logged in, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="personal-info-container">
      <div className="personal-info-card">
        <div className="personal-info-header">
          <h2>Complete Your Profile</h2>
          <p>Help us personalize your nutrition tracking experience</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="personal-info-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              min="1"
              max="120"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="Height in cm"
                min="50"
                max="250"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight in kg"
                min="20"
                max="300"
                step="0.1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Profile & Continue'}
          </button>
        </form>

        <div className="personal-info-note">
          <p>💡 This information helps us calculate your daily calorie needs and provide personalized recommendations.</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;