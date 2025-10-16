import React, { useState, useEffect } from 'react';
import { mealAPI } from '../utils/api';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentMeals, setRecentMeals] = useState([]);

  useEffect(() => {
    fetchWeeklyData();
    fetchRecentMeals();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const response = await mealAPI.getWeeklyData();
      setWeeklyData(response.data);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    }
  };

  const fetchRecentMeals = async () => {
    try {
      const response = await mealAPI.getMeals();
      setRecentMeals(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent meals:', error);
    }
  };

  const calculateWeeklyStats = () => {
    const totalCalories = weeklyData.reduce((sum, day) => sum + day.totalCalories, 0);
    const avgDailyCalories = weeklyData.length > 0 ? Math.round(totalCalories / weeklyData.length) : 0;
    const daysTracked = weeklyData.length;
    
    return { totalCalories, avgDailyCalories, daysTracked };
  };

  const { totalCalories, avgDailyCalories, daysTracked } = calculateWeeklyStats();

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>Weekly Dashboard</h1>
        
        {/* Weekly Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
              {totalCalories}
            </div>
            <div style={{ color: '#666' }}>Total Weekly Calories</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3' }}>
              {avgDailyCalories}
            </div>
            <div style={{ color: '#666' }}>Avg Daily Calories</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
              {daysTracked}/7
            </div>
            <div style={{ color: '#666' }}>Days Tracked</div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="card">
          <h3>Weekly Calorie Intake</h3>
          {weeklyData.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              {weeklyData.map((day, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{day._id.date}</span>
                    <span>{day.totalCalories} cal</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    background: '#f0f0f0', 
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{ 
                        width: `${Math.min(100, (day.totalCalories / 2000) * 100)}%`,
                        background: '#4CAF50',
                        height: '20px',
                        borderRadius: '10px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>No data available for this week</p>
          )}
        </div>

        {/* Recent Meals */}
        <div className="card">
          <h3>Recent Meals</h3>
          {recentMeals.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              {recentMeals.map(meal => (
                <div key={meal._id} style={{ 
                  padding: '10px', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{meal.foodName}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {meal.mealType} • {meal.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{meal.calories} cal</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>No recent meals</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;