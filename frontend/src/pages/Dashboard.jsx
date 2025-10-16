import React, { useState, useEffect } from 'react';
import { mealAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentMeals, setRecentMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({});

  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [weeklyResponse, mealsResponse] = await Promise.all([
        mealAPI.getWeeklyData(),
        mealAPI.getMeals()
      ]);

      setWeeklyData(weeklyResponse.data);
      setRecentMeals(mealsResponse.data.slice(0, 10));
      
      // Calculate streak and monthly stats
      calculateStreak(mealsResponse.data);
      calculateMonthlyStats(mealsResponse.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (meals) => {
    if (!meals || meals.length === 0) {
      setStreak(0);
      return;
    }

    // Get unique dates when meals were logged
    const mealDates = [...new Set(meals.map(meal => 
      new Date(meal.date).toDateString()
    ))].sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    const today = new Date();
    let currentDate = new Date(today);

    // Check consecutive days from today backwards
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toDateString();
      if (mealDates.includes(dateStr)) {
        currentStreak++;
      } else if (currentDate < today) {
        // Stop if we find a day without meals (and it's not today)
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }

    setStreak(currentStreak);
  };

  const calculateMonthlyStats = (meals) => {
    const monthlyData = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter meals from current month
    const monthlyMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate.getMonth() === currentMonth && mealDate.getFullYear() === currentYear;
    });

    const totalCalories = monthlyMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = monthlyMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = monthlyMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = monthlyMeals.reduce((sum, meal) => sum + meal.fat, 0);
    const daysTracked = [...new Set(monthlyMeals.map(meal => 
      new Date(meal.date).toDateString()
    ))].length;

    setMonthlyStats({
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      daysTracked,
      averageDailyCalories: Math.round(totalCalories / Math.max(daysTracked, 1))
    });
  };

  const calculateWeeklyStats = () => {
    const totalCalories = weeklyData.reduce((sum, day) => sum + day.totalCalories, 0);
    const totalProtein = weeklyData.reduce((sum, day) => sum + day.totalProtein, 0);
    const totalCarbs = weeklyData.reduce((sum, day) => sum + day.totalCarbs, 0);
    const totalFat = weeklyData.reduce((sum, day) => sum + day.totalFat, 0);
    const avgDailyCalories = weeklyData.length > 0 ? Math.round(totalCalories / weeklyData.length) : 0;
    const daysTracked = weeklyData.length;
    
    return { totalCalories, avgDailyCalories, daysTracked, totalProtein, totalCarbs, totalFat };
  };

  const { totalCalories, avgDailyCalories, daysTracked, totalProtein, totalCarbs, totalFat } = calculateWeeklyStats();

  const getStreakMessage = (streak) => {
    if (streak === 0) return "Start tracking to build your streak!";
    if (streak === 1) return "Great start! Keep going tomorrow!";
    if (streak < 7) return `Awesome! ${streak} days in a row!`;
    if (streak < 14) return `Amazing! ${streak} day streak!`;
    if (streak < 30) return `Incredible! ${streak} days strong!`;
    return `Legendary! ${streak} days streak! 🏆`;
  };

  const getCalorieGoal = () => {
    // Simple calorie goal calculation based on user info
    if (!user?.personalInfo) return 2000;
    
    const { weight, height, age, gender } = user.personalInfo;
    if (!weight || !height || !age || !gender) return 2000;

    // Basic BMR calculation
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    return Math.round(bmr * 1.2); // Sedentary activity level
  };

  const calorieGoal = getCalorieGoal();

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #4CAF50',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '20px', color: '#666' }}>Loading your dashboard...</p>
            <style>
              {`@keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }`}
            </style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '0.5rem' }}>Nutrition Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Track your progress and stay motivated
        </p>

        {/* Streak and Motivation Section */}
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '2.5rem' }}>{streak} 🔥</h2>
              <p style={{ margin: 0, opacity: 0.9 }}>{getStreakMessage(streak)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '3rem' }}>
                {streak >= 7 ? '🏆' : streak >= 3 ? '⭐' : '🌱'}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', background: '#e8f5e8' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
              {totalCalories}
            </div>
            <div style={{ color: '#666' }}>Weekly Calories</div>
            <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
              Goal: {calorieGoal * 7}
            </div>
          </div>
          
          <div className="card" style={{ textAlign: 'center', background: '#e3f2fd' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3' }}>
              {avgDailyCalories}
            </div>
            <div style={{ color: '#666' }}>Avg Daily Calories</div>
            <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
              Goal: {calorieGoal}
            </div>
          </div>
          
          <div className="card" style={{ textAlign: 'center', background: '#fff3e0' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
              {daysTracked}/7
            </div>
            <div style={{ color: '#666' }}>Days Tracked</div>
            <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
              This week
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center', background: '#fce4ec' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e91e63' }}>
              {Math.round((daysTracked / 7) * 100)}%
            </div>
            <div style={{ color: '#666' }}>Weekly Completion</div>
            <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
              Consistency score
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Weekly Calorie Intake Chart */}
          <div className="card">
            <h3>Weekly Calorie Intake</h3>
            {weeklyData.length > 0 ? (
              <div style={{ marginTop: '1rem' }}>
                {weeklyData.map((day, index) => {
                  const percentage = Math.min((day.totalCalories / calorieGoal) * 100, 100);
                  const date = new Date(day._id.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  
                  return (
                    <div key={index} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{dayName}</span>
                        <span>{day.totalCalories} / {calorieGoal} cal</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        background: '#f0f0f0', 
                        borderRadius: '10px',
                        overflow: 'hidden',
                        height: '20px'
                      }}>
                        <div 
                          style={{ 
                            width: `${percentage}%`,
                            background: percentage > 90 ? '#f44336' : percentage > 70 ? '#ff9800' : '#4CAF50',
                            height: '100%',
                            borderRadius: '10px',
                            transition: 'width 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: '10px',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {Math.round(percentage)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                No data available for this week. Start tracking your meals!
              </p>
            )}
          </div>

          {/* Macronutrient Breakdown */}
          <div className="card">
            <h3>Macronutrient Distribution</h3>
            {totalCalories > 0 ? (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Protein</span>
                    <span>{totalProtein}g ({(totalProtein * 4 / totalCalories * 100).toFixed(1)}%)</span>
                  </div>
                  <div style={{ width: '100%', background: '#f0f0f0', borderRadius: '10px', height: '15px' }}>
                    <div style={{ width: `${(totalProtein * 4 / totalCalories * 100)}%`, background: '#4CAF50', height: '100%', borderRadius: '10px' }} />
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Carbohydrates</span>
                    <span>{totalCarbs}g ({(totalCarbs * 4 / totalCalories * 100).toFixed(1)}%)</span>
                  </div>
                  <div style={{ width: '100%', background: '#f0f0f0', borderRadius: '10px', height: '15px' }}>
                    <div style={{ width: `${(totalCarbs * 4 / totalCalories * 100)}%`, background: '#2196f3', height: '100%', borderRadius: '10px' }} />
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Fat</span>
                    <span>{totalFat}g ({(totalFat * 9 / totalCalories * 100).toFixed(1)}%)</span>
                  </div>
                  <div style={{ width: '100%', background: '#f0f0f0', borderRadius: '10px', height: '15px' }}>
                    <div style={{ width: `${(totalFat * 9 / totalCalories * 100)}%`, background: '#ff9800', height: '100%', borderRadius: '10px' }} />
                  </div>
                </div>

                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Recommended Ratios</h4>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Protein: 20-30% • Carbs: 45-65% • Fat: 20-35%
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                Track meals to see macronutrient breakdown
              </p>
            )}
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Monthly Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
                {monthlyStats.totalCalories || 0}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Calories</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                {monthlyStats.averageDailyCalories || 0}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Avg Daily</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>
                {monthlyStats.daysTracked || 0}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Days Tracked</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e91e63' }}>
                {Math.round(((monthlyStats.daysTracked || 0) / new Date().getDate()) * 100)}%
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Month Progress</div>
            </div>
          </div>
        </div>

        {/* Recent Meals */}
        <div className="card">
          <h3>Recent Meals</h3>
          {recentMeals.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              {recentMeals.map(meal => (
                <div key={meal._id} style={{ 
                  padding: '12px', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <strong>{meal.foodName}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {meal.mealType} • {meal.quantity}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      {new Date(meal.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{meal.calories} cal</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              No meals tracked yet. Add your first meal to see it here!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;