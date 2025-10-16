import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictorAPI, mealAPI } from '../utils/api';
import Navbar from '../components/Navbar';

const Predictor = () => {
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '1',
    mealType: 'Breakfast'
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await predictorAPI.predictCalories({
        foodName: formData.foodName,
        quantity: formData.quantity
      });
      setPrediction(response.data);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async () => {
    if (!prediction) return;
    
    try {
      await mealAPI.addMeal({
        ...prediction,
        mealType: formData.mealType
      });
      navigate('/home');
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Food Nutrition Predictor</h2>
          <p>Enter food details to get nutritional information</p>
          
          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label>Food Name</label>
              <input
                type="text"
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                placeholder="e.g., Apple, Chicken Breast, Rice"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 1, 100g, 2 pieces"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Meal Type</label>
              <select name="mealType" value={formData.mealType} onChange={handleChange}>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Nutrition'}
            </button>
          </form>
        </div>

        {prediction && (
          <div className="card">
            <h3>Nutrition Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#fff3e0', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>
                  {prediction.calories}
                </div>
                <div style={{ color: '#666' }}>Calories</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#e8f5e8', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
                  {prediction.protein}g
                </div>
                <div style={{ color: '#666' }}>Protein</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                  {prediction.carbs}g
                </div>
                <div style={{ color: '#666' }}>Carbs</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#fce4ec', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e91e63' }}>
                  {prediction.fat}g
                </div>
                <div style={{ color: '#666' }}>Fat</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Food:</strong> {prediction.foodName}<br />
              <strong>Quantity:</strong> {prediction.quantity}
            </div>
            
            <button onClick={handleAddMeal} className="btn btn-primary">
              Add to {formData.mealType}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictor;