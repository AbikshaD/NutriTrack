import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictorAPI, mealAPI } from '../utils/api';
import Navbar from '../components/Navbar';

const Predictor = () => {
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '100',
    mealType: 'Breakfast'
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [datasetStats, setDatasetStats] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasetStats();
  }, []);

  const fetchDatasetStats = async () => {
    try {
      const response = await predictorAPI.getDatasetStats();
      setDatasetStats(response.data);
    } catch (error) {
      console.error('Error fetching dataset stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await predictorAPI.searchDataset(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching dataset:', error);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    
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
        foodName: formData.foodName,
        quantity: `${formData.quantity}g`,
        calories: prediction.calories,
        protein: prediction.protein,
        carbs: prediction.carbs,
        fat: prediction.fat,
        mealType: formData.mealType
      });
      navigate('/home');
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.5) return '#FF9800';
    return '#F44336';
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        {/* Dataset Stats */}
        {datasetStats && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h4>ML Model Status</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <strong>Foods in Dataset:</strong> {datasetStats.totalFoods}
              </div>
              <div>
                <strong>Model Trained:</strong> {datasetStats.modelTrained ? '✅' : '❌'}
              </div>
              <div>
                <strong>Training Samples:</strong> {datasetStats.trainingSamples}
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2>AI Nutrition Predictor</h2>
          <p>Enter food details to get AI-powered nutrition predictions</p>
          
          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label>Food Name</label>
              <input
                type="text"
                name="foodName"
                value={formData.foodName}
                onChange={(e) => {
                  handleChange(e);
                  handleSearch(e.target.value);
                }}
                placeholder="e.g., Apple, Chicken Breast, Rice"
                required
              />
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '5px', 
                  marginTop: '5px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {searchResults.map(food => (
                    <div
                      key={food._id}
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: '#f9f9f9'
                      }}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          foodName: food.foodName
                        });
                        setSearchResults([]);
                      }}
                    >
                      <strong>{food.foodName}</strong> - {food.calories} cal
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Quantity (grams)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 100"
                min="1"
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
              {loading ? 'AI Predicting...' : 'Predict Nutrition'}
            </button>
          </form>
        </div>

        {prediction && (
          <div className="card">
            <h3>AI Nutrition Prediction</h3>
            
            {/* Prediction Confidence */}
            <div style={{ 
              marginBottom: '1rem',
              padding: '10px',
              background: '#e3f2fd',
              borderRadius: '5px',
              border: `2px solid ${getConfidenceColor(prediction.confidence)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Prediction Method:</strong> {prediction.method.replace('_', ' ').toUpperCase()}
                </div>
                <div style={{ 
                  background: getConfidenceColor(prediction.confidence),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '10px',
                  fontSize: '0.8rem'
                }}>
                  Confidence: {(prediction.confidence * 100).toFixed(0)}%
                </div>
              </div>
              
              {prediction.matchedFood && (
                <div style={{ marginTop: '5px' }}>
                  <strong>Matched:</strong> {prediction.matchedFood}
                </div>
              )}
              
              {prediction.similarFoods && (
                <div style={{ marginTop: '5px' }}>
                  <strong>Similar foods used:</strong> {prediction.similarFoods.join(', ')}
                </div>
              )}
            </div>

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