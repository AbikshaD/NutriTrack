import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mealAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Home = () => {
  const [meals, setMeals] = useState([]);
  const [todaySummary, setTodaySummary] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  });

  const { user } = useAuth();

  const motivationalQuotes = [
    "Every meal is a chance to nourish your body.",
    "Small changes today create big results tomorrow.",
    "Your body hears everything your mind says. Stay positive!",
    "Progress, not perfection.",
    "Take care of your body. It's the only place you have to live."
  ];

  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  useEffect(() => {
    fetchTodayMeals();
  }, []);

  const fetchTodayMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await mealAPI.getMeals(today);
      setMeals(response.data);
      
      // Calculate totals
      const totals = response.data.reduce((acc, meal) => ({
        totalCalories: acc.totalCalories + meal.calories,
        totalProtein: acc.totalProtein + meal.protein,
        totalCarbs: acc.totalCarbs + meal.carbs,
        totalFat: acc.totalFat + meal.fat
      }), {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      });
      
      setTodaySummary(totals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const getMealsByType = (mealType) => {
    return meals.filter(meal => meal.mealType === mealType);
  };

  const MealSection = ({ mealType }) => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>{mealType}</h3>
        <Link to="/predictor" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          +
        </Link>
      </div>
      {getMealsByType(mealType).map(meal => (
        <div key={meal._id} style={{ 
          padding: '10px', 
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            <strong>{meal.foodName}</strong>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>{meal.quantity}</div>
          </div>
          <div style={{ fontWeight: 'bold' }}>{meal.calories} cal</div>
        </div>
      ))}
      {getMealsByType(mealType).length === 0 && (
        <p style={{ color: '#999', textAlign: 'center' }}>No meals added yet</p>
      )}
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="container">
        {/* Motivational Quote */}
        <div className="card" style={{ background: '#e8f5e8', borderLeft: '4px solid #4CAF50' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>💪 Daily Motivation</h3>
          <p style={{ fontStyle: 'italic', margin: 0 }}>"{getRandomQuote()}"</p>
        </div>

        {/* User Profile Section - ADDED THIS SECTION */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Welcome, {user.personalInfo?.name || user.username}!</h3>
              {user.personalInfo?.name && (
                <p style={{ color: '#666', margin: 0 }}>
                  {user.personalInfo.age && `Age: ${user.personalInfo.age} • `}
                  {user.personalInfo.height && `Height: ${user.personalInfo.height}cm • `}
                  {user.personalInfo.weight && `Weight: ${user.personalInfo.weight}kg`}
                </p>
              )}
            </div>
            <Link 
              to="/profile" 
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              {user.personalInfo?.name ? 'Edit Profile' : 'Complete Profile'}
            </Link>
          </div>
          
          {!user.personalInfo?.name && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#fff3e0', 
              borderRadius: '5px',
              border: '1px solid #ffb74d'
            }}>
              <p style={{ margin: 0, color: '#e65100' }}>
                ⚠️ Complete your profile to get personalized nutrition recommendations.
              </p>
            </div>
          )}
        </div>

        {/* Today's Summary */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Today's Nutrition</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#fff3e0', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
                {todaySummary.totalCalories}
              </div>
              <div style={{ color: '#666' }}>Calories</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#e8f5e8', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
                {todaySummary.totalProtein}g
              </div>
              <div style={{ color: '#666' }}>Protein</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3' }}>
                {todaySummary.totalCarbs}g
              </div>
              <div style={{ color: '#666' }}>Carbs</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#fce4ec', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e91e63' }}>
                {todaySummary.totalFat}g
              </div>
              <div style={{ color: '#666' }}>Fat</div>
            </div>
          </div>
        </div>

        {/* Meal Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <MealSection mealType="Breakfast" />
          <MealSection mealType="Lunch" />
          <MealSection mealType="Dinner" />
        </div>
      </div>
    </div>
  );
};

export default Home;