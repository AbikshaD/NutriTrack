import React, { useState, useEffect, useCallback } from 'react';
import { mealAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const Dashboard = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentMeals, setRecentMeals] = useState([]);
  const [todayData, setTodayData] = useState({ 
    totalCalories: 0, 
    totalProtein: 0, 
    totalCarbs: 0, 
    totalFat: 0,
    meals: [] 
  });
  const [dailyGoal, setDailyGoal] = useState(2000);

  // === Fetch Today's Data - This updates both progress bar and graph ===
  const fetchTodayData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await mealAPI.getMeals(today);
      const todayMeals = response.data || [];
      
      const totals = todayMeals.reduce((acc, meal) => ({
        totalCalories: acc.totalCalories + (meal.calories || 0),
        totalProtein: acc.totalProtein + (meal.protein || 0),
        totalCarbs: acc.totalCarbs + (meal.carbs || 0),
        totalFat: acc.totalFat + (meal.fat || 0)
      }), {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      });
      
      setTodayData({
        ...totals,
        meals: todayMeals
      });
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
    }
  }, []);

  // === Fetch Recent Meals ===
  const fetchRecentMeals = useCallback(async () => {
    try {
      const response = await mealAPI.getMeals();
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentMeals(sorted.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent meals:', error);
    }
  }, []);

  // === Fetch Weekly Data ===
  const fetchWeeklyData = useCallback(async () => {
    try {
      const response = await mealAPI.getWeeklyData();
      const processedData = response.data
        .filter(item => item._id && item._id.date)
        .map(item => {
          let dateObj;
          let dayName;
          
          try {
            if (typeof item._id.date === 'string') {
              dateObj = new Date(item._id.date);
            } else {
              dateObj = new Date();
            }
            
            if (isNaN(dateObj.getTime())) {
              dateObj = new Date();
            }
            
            dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          } catch (error) {
            dateObj = new Date();
            dayName = 'N/A';
          }
          
          return {
            ...item,
            date: dateObj,
            day: dayName,
            totalCalories: item.totalCalories || 0
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setWeeklyData(processedData);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setWeeklyData([]);
    }
  }, []);

  // === Refresh all data ===
  const refreshAllData = useCallback(() => {
    fetchTodayData();
    fetchRecentMeals();
    fetchWeeklyData();
  }, [fetchTodayData, fetchRecentMeals, fetchWeeklyData]);

  useEffect(() => {
    refreshAllData();

    // Auto-refresh every 10 seconds to catch new meals
    const interval = setInterval(refreshAllData, 10000);

    return () => clearInterval(interval);
  }, [refreshAllData]);

  // === Today's Progress Calculations ===
  const calculateTodayProgress = () => {
    const progress = (todayData.totalCalories / dailyGoal) * 100;
    return Math.min(progress, 100);
  };

  const getProgressBarColor = () => {
    const progress = calculateTodayProgress();
    if (progress < 70) return '#4CAF50';
    if (progress < 90) return '#FF9800';
    return '#F44336';
  };

  const getRemainingCalories = () => {
    return Math.max(0, dailyGoal - todayData.totalCalories);
  };

  // === Create graph data that shows all week days correctly ===
// === Create graph data that shows 7 days including today ===
const getGraphData = () => {
  const today = new Date();
  const weekDates = [];

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - i);
    weekDates.push({
      date: dateObj,
      day: dateObj.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }

  // Map weeklyData to a dictionary for quick lookup
  const dataMap = {};
  weeklyData.forEach(item => {
    const key = new Date(item.date).toDateString();
    dataMap[key] = item.totalCalories || 0;
  });

  // Build graph data array for 7 days
  const graphArray = weekDates.map(d => {
    const key = d.date.toDateString();
    const calories = key === today.toDateString() ? todayData.totalCalories : (dataMap[key] || 0);
    return {
      day: key === today.toDateString() ? 'Today' : d.day,
      totalCalories: calories,
      date: d.date
    };
  });

  return graphArray;
};



  // === Weekly Stats (based on actual weekly data) ===
  const calculateWeeklyStats = () => {
    const totalCalories = weeklyData.reduce((sum, day) => sum + (day.totalCalories || 0), 0);
    const avgDailyCalories = weeklyData.length > 0 ? Math.round(totalCalories / weeklyData.length) : 0;
    const daysTracked = weeklyData.filter(day => day.totalCalories > 0).length;
    return { totalCalories, avgDailyCalories, daysTracked };
  };

  const { totalCalories, avgDailyCalories, daysTracked } = calculateWeeklyStats();
  const todayProgress = calculateTodayProgress();
  const progressColor = getProgressBarColor();
  const remainingCalories = getRemainingCalories();
  const graphData = getGraphData();

  // === Macronutrient Progress ===
  const getMacronutrientProgress = () => {
    const proteinGoal = 50;
    const carbsGoal = 250;
    const fatGoal = 70;

    return {
      protein: {
        current: todayData.totalProtein,
        goal: proteinGoal,
        progress: Math.min((todayData.totalProtein / proteinGoal) * 100, 100)
      },
      carbs: {
        current: todayData.totalCarbs,
        goal: carbsGoal,
        progress: Math.min((todayData.totalCarbs / carbsGoal) * 100, 100)
      },
      fat: {
        current: todayData.totalFat,
        goal: fatGoal,
        progress: Math.min((todayData.totalFat / fatGoal) * 100, 100)
      }
    };
  };

  const macroProgress = getMacronutrientProgress();

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '2rem' }}>Weekly Dashboard</h1>

        {/* === Today's Goal Progress === */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Today's Progress</h3>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {todayData.totalCalories} / {dailyGoal} cal
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{ 
            width: '100%', 
            height: '30px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '15px',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '1rem'
          }}>
            <div 
              style={{
                width: `${todayProgress}%`,
                height: '100%',
                backgroundColor: progressColor,
                borderRadius: '15px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '10px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}
            >
              {todayProgress > 25 ? `${Math.round(todayProgress)}%` : ''}
            </div>
            {todayProgress <= 25 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                fontWeight: 'bold',
                color: '#666'
              }}>
                {Math.round(todayProgress)}%
              </div>
            )}
          </div>

          {/* Progress Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: progressColor }}>
                {todayData.totalCalories}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Consumed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196F3' }}>
                {remainingCalories}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Remaining</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
                {todayData.meals.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Meals Today</div>
            </div>
          </div>

          {/* Macronutrient Progress */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Macronutrients</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Protein</span>
                  <span>{macroProgress.protein.current}g / {macroProgress.protein.goal}g</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${macroProgress.protein.progress}%`,
                    height: '100%',
                    backgroundColor: '#4CAF50',
                    transition: 'all 0.3s ease'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Carbs</span>
                  <span>{macroProgress.carbs.current}g / {macroProgress.carbs.goal}g</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${macroProgress.carbs.progress}%`,
                    height: '100%',
                    backgroundColor: '#2196F3',
                    transition: 'all 0.3s ease'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Fat</span>
                  <span>{macroProgress.fat.current}g / {macroProgress.fat.goal}g</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${macroProgress.fat.progress}%`,
                    height: '100%',
                    backgroundColor: '#E91E63',
                    transition: 'all 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Weekly Stats === */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
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

        {/* === 📊 Updated Bar Chart that shows real-time data === */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3>Weekly Calorie Intake</h3>
          {graphData.length > 0 ? (
            <div style={{ width: '100%', height: 350, marginTop: '1rem' }}>
              <ResponsiveContainer>
                <BarChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[0, 'dataMax + 500']}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} cal`, 'Calories']}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  
                  <Bar 
                    dataKey="totalCalories" 
                    fill="#4CAF50" 
                    barSize={50} 
                    radius={[10, 10, 0, 0]}
                    name="Calories"
                  />

                  <ReferenceLine 
                    y={dailyGoal} 
                    stroke="#f44336" 
                    strokeDasharray="5 5" 
                    label={{
                      value: `Goal: ${dailyGoal} cal`,
                      position: 'top',
                      fill: '#f44336',
                      fontSize: 12,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>No data available for this week</p>
          )}
        </div>

        {/* Rest of your components remain the same */}
        {/* ... */}
      </div>
    </div>
  );
};

export default Dashboard;