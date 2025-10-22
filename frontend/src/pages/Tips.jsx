import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Tips = () => {
  const { user } = useAuth();
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [dietPlan, setDietPlan] = useState(null);
  const [healthTips, setHealthTips] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState(0);
  const [weightGoal, setWeightGoal] = useState('');

  useEffect(() => {
    if (user?.personalInfo?.height && user?.personalInfo?.weight) {
      calculateBMI();
      generateDietPlan();
    }
    generateHealthTips();
  }, [user]);

  const calculateBMI = () => {
    const { height, weight } = user.personalInfo;
    
    if (height && weight) {
      const heightInMeters = height / 100;
      const calculatedBMI = weight / (heightInMeters * heightInMeters);
      setBmi(calculatedBMI.toFixed(1));
      
      // Determine BMI category
      if (calculatedBMI < 18.5) {
        setBmiCategory('Underweight');
        setWeightGoal('Weight Gain');
      } else if (calculatedBMI < 25) {
        setBmiCategory('Normal Weight');
        setWeightGoal('Weight Maintenance');
      } else if (calculatedBMI < 30) {
        setBmiCategory('Overweight');
        setWeightGoal('Weight Loss');
      } else {
        setBmiCategory('Obese');
        setWeightGoal('Weight Loss');
      }
    }
  };

  const calculateDailyCalories = () => {
    const { weight, height, age, gender } = user.personalInfo;
    
    // Base Metabolic Rate calculation
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * (age || 30));
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * (age || 30));
    }

    // Activity multiplier (assuming sedentary lifestyle)
    const activityMultiplier = 1.2;

    // Calculate maintenance calories
    const maintenanceCalories = Math.round(bmr * activityMultiplier);

    // Adjust based on BMI category and goal
    let targetCalories = maintenanceCalories;

    if (bmiCategory === 'Underweight') {
      // Calorie surplus for weight gain
      targetCalories = maintenanceCalories + 300;
    } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
      // Calorie deficit for weight loss
      targetCalories = maintenanceCalories - 500;
    }
    // Normal weight maintains maintenance calories

    setCalorieGoal(targetCalories);
    return targetCalories;
  };

  const generateDietPlan = () => {
    const { weight } = user.personalInfo;
    
    if (!weight) return;

    const dailyCalories = calculateDailyCalories();
    let plan = {};

    // Calculate meal distribution percentages
    const mealDistribution = {
      breakfast: 25, // 25% of daily calories
      morningSnack: 10, // 10% of daily calories
      lunch: 30, // 30% of daily calories
      eveningSnack: 10, // 10% of daily calories
      dinner: 25 // 25% of daily calories
    };

    if (bmiCategory === 'Underweight') {
      plan = {
        title: 'Weight Gain Diet Plan',
        description: `Personalized plan to help you gain healthy weight`,
        dailyCalories: dailyCalories,
        weeklyGoal: `Gain 0.25-0.5 kg per week`,
        currentWeight: `${weight} kg`,
        targetWeight: `${Math.round(weight * 1.1)} kg`,
        macronutrients: {
          protein: `${Math.round((dailyCalories * 0.25) / 4)}g (25%)`,
          carbs: `${Math.round((dailyCalories * 0.50) / 4)}g (50%)`,
          fat: `${Math.round((dailyCalories * 0.25) / 9)}g (25%)`
        },
        mealDistribution: mealDistribution,
        tips: [
          `Aim for ${dailyCalories} calories daily for steady weight gain`,
          'Focus on calorie-dense healthy foods like nuts, avocados, and whole grains',
          'Include protein with every meal for muscle building',
          'Eat every 3-4 hours to maintain calorie surplus',
          'Combine with strength training 3-4 times weekly'
        ]
      };
    } else if (bmiCategory === 'Normal Weight') {
      plan = {
        title: 'Weight Maintenance Diet Plan',
        description: `Maintain your healthy weight with balanced nutrition`,
        dailyCalories: dailyCalories,
        weeklyGoal: `Maintain current weight`,
        currentWeight: `${weight} kg`,
        targetWeight: `${weight} kg`,
        macronutrients: {
          protein: `${Math.round((dailyCalories * 0.25) / 4)}g (25%)`,
          carbs: `${Math.round((dailyCalories * 0.45) / 4)}g (45%)`,
          fat: `${Math.round((dailyCalories * 0.30) / 9)}g (30%)`
        },
        mealDistribution: mealDistribution,
        tips: [
          `Maintain ${dailyCalories} calories daily to sustain your weight`,
          'Practice portion control and mindful eating',
          'Include variety of colorful vegetables daily',
          'Balance your macronutrients throughout the day',
          'Regular physical activity 4-5 times weekly'
        ]
      };
    } else {
      // Overweight or Obese
      const targetWeight = Math.round(weight * 0.9); // 10% weight loss target
      plan = {
        title: 'Weight Loss Diet Plan',
        description: `Healthy weight loss through calorie control`,
        dailyCalories: dailyCalories,
        weeklyGoal: `Lose 0.5-1 kg per week`,
        currentWeight: `${weight} kg`,
        targetWeight: `${targetWeight} kg`,
        macronutrients: {
          protein: `${Math.round((dailyCalories * 0.30) / 4)}g (30%)`,
          carbs: `${Math.round((dailyCalories * 0.40) / 4)}g (40%)`,
          fat: `${Math.round((dailyCalories * 0.30) / 9)}g (30%)`
        },
        mealDistribution: mealDistribution,
        tips: [
          `Stick to ${dailyCalories} calories daily for safe weight loss`,
          'Focus on protein and fiber to feel full longer',
          'Avoid sugary drinks and processed foods',
          'Practice mindful eating and track all meals',
          'Combine with 150+ minutes of cardio weekly'
        ]
      };
    }

    setDietPlan(plan);
  };

  const generateHealthTips = () => {
    const tips = [
      {
        category: 'Your Daily Goals',
        icon: '🎯',
        tips: [
          `Daily Calorie Target: ${calorieGoal} calories`,
          `Weight Goal: ${weightGoal}`,
          `Current BMI: ${bmi} (${bmiCategory})`,
          `Progress: Track your meals daily in the Home page`
        ]
      },
      {
        category: 'Nutrition Strategy',
        icon: '🥗',
        tips: [
          bmiCategory === 'Underweight' ? 'Focus on calorie-dense healthy foods' : 
          bmiCategory === 'Normal Weight' ? 'Maintain balanced macronutrients' : 
          'Emphasize protein and fiber for satiety',
          'Include lean proteins in every meal',
          'Choose complex carbs over simple sugars',
          'Stay hydrated with 2-3 liters of water daily'
        ]
      },
      {
        category: 'Meal Timing',
        icon: '⏰',
        tips: [
          'Spread calories throughout the day',
          'Don\'t skip breakfast',
          'Include healthy snacks between meals',
          'Finish dinner 2-3 hours before bedtime'
        ]
      },
      {
        category: 'Exercise Plan',
        icon: '💪',
        tips: [
          bmiCategory === 'Underweight' ? 'Strength training 3-4x weekly' : 
          'Cardio + strength training mix',
          'Aim for 150 minutes moderate exercise weekly',
          'Include rest days for recovery',
          'Find activities you enjoy for consistency'
        ]
      }
    ];

    setHealthTips(tips);
  };

  const getBMIColor = () => {
    if (bmiCategory === 'Underweight') return '#ff9800';
    if (bmiCategory === 'Normal Weight') return '#4CAF50';
    if (bmiCategory === 'Overweight') return '#ff9800';
    return '#f44336';
  };

  const getBMIRecommendation = () => {
    switch (bmiCategory) {
      case 'Underweight':
        return `Based on your BMI of ${bmi}, we recommend a calorie surplus diet. Aim for ${calorieGoal} calories daily to gain healthy weight gradually.`;
      case 'Normal Weight':
        return `Your BMI of ${bmi} is in the healthy range. Maintain your weight with ${calorieGoal} calories daily and focus on balanced nutrition.`;
      case 'Overweight':
        return `Based on your BMI of ${bmi}, we recommend a calorie-controlled diet. Target ${calorieGoal} calories daily for safe, gradual weight loss.`;
      case 'Obese':
        return `Your BMI of ${bmi} indicates significant weight concerns. We recommend ${calorieGoal} calories daily and consulting a healthcare provider.`;
      default:
        return 'Complete your profile to get personalized recommendations.';
    }
  };

  // Show profile completion message if no height/weight data
  if (!user?.personalInfo?.height || !user?.personalInfo?.weight) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: '3rem', marginTop: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h2 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Complete Your Profile</h2>
            <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Add your height and weight to get personalized calorie goals and diet plans.
            </p>
            <a 
              href="/profile" 
              className="btn btn-primary"
              style={{ 
                textDecoration: 'none',
                padding: '12px 24px',
                fontSize: '1.1rem'
              }}
            >
              Update Profile Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '0.5rem', color: '#2e7d32' }}>Personalized Health Plan</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Customized recommendations based on your BMI and body metrics
        </p>

        {/* Personal Health Assessment */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2e7d32', marginBottom: '1.5rem' }}>Your Personal Health Assessment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: getBMIColor(),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                {bmi}
              </div>
              <div style={{ 
                fontSize: '1.3rem', 
                fontWeight: 'bold',
                color: getBMIColor(),
                marginBottom: '0.5rem'
              }}>
                {bmiCategory}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Body Mass Index
              </div>
            </div>
            
            <div>
              <h4 style={{ color: '#333', marginBottom: '1rem' }}>Personalized Recommendation</h4>
              <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1rem', marginBottom: '1.5rem' }}>
                {getBMIRecommendation()}
              </p>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '10px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Current Weight</div>
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{user.personalInfo.weight} kg</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Height</div>
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{user.personalInfo.height} cm</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Daily Calories</div>
                  <div style={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '1.1rem' }}>{calorieGoal}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Goal</div>
                  <div style={{ fontWeight: 'bold', color: '#2196f3', fontSize: '1.1rem' }}>{weightGoal}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Diet Plan */}
        {dietPlan && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '1rem' }}>{dietPlan.title}</h2>
            <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{dietPlan.description}</p>
            <p style={{ color: '#4CAF50', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              {dietPlan.weeklyGoal} • Current: {dietPlan.currentWeight} • Target: {dietPlan.targetWeight}
            </p>
            
            {/* Daily Calorie Progress */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Daily Calorie Target</h3>
              <div style={{ 
                background: '#f0f0f0', 
                borderRadius: '10px', 
                padding: '2rem',
                textAlign: 'center',
                border: '2px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#4CAF50', marginBottom: '0.5rem' }}>
                  {dietPlan.dailyCalories}
                </div>
                <div style={{ color: '#666', fontSize: '1.1rem' }}>Calories Per Day</div>
                <div style={{ 
                  width: '100%', 
                  height: '20px', 
                  background: '#e0e0e0', 
                  borderRadius: '10px',
                  marginTop: '1rem',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #4CAF50, #45a049)',
                    borderRadius: '10px'
                  }}></div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  <span>0</span>
                  <span>Daily Goal</span>
                  <span>{dietPlan.dailyCalories}</span>
                </div>
              </div>
            </div>

            {/* Macronutrient Distribution */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Macronutrient Distribution</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem'
              }}>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#e8f5e8', borderRadius: '10px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50', marginBottom: '0.5rem' }}>
                    Protein
                  </div>
                  <div style={{ color: '#666', fontSize: '1rem' }}>{dietPlan.macronutrients.protein}</div>
                  <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    background: '#c8e6c9', 
                    borderRadius: '5px',
                    marginTop: '1rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: '25%',
                      height: '100%',
                      background: '#4CAF50',
                      borderRadius: '5px'
                    }}></div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#e3f2fd', borderRadius: '10px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3', marginBottom: '0.5rem' }}>
                    Carbs
                  </div>
                  <div style={{ color: '#666', fontSize: '1rem' }}>{dietPlan.macronutrients.carbs}</div>
                  <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    background: '#bbdefb', 
                    borderRadius: '5px',
                    marginTop: '1rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: bmiCategory === 'Underweight' ? '50%' : bmiCategory === 'Normal Weight' ? '45%' : '40%',
                      height: '100%',
                      background: '#2196f3',
                      borderRadius: '5px'
                    }}></div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#fff3e0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800', marginBottom: '0.5rem' }}>
                    Fat
                  </div>
                  <div style={{ color: '#666', fontSize: '1rem' }}>{dietPlan.macronutrients.fat}</div>
                  <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    background: '#ffe0b2', 
                    borderRadius: '5px',
                    marginTop: '1rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: '25%',
                      height: '100%',
                      background: '#ff9800',
                      borderRadius: '5px'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Distribution Progress */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Recommended Meal Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(dietPlan.mealDistribution).map(([meal, percentage]) => {
                  const mealCalories = Math.round((dietPlan.dailyCalories * percentage) / 100);
                  const mealName = meal.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  return (
                    <div key={meal} style={{ 
                      padding: '1rem', 
                      background: '#f8f9fa', 
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>{mealName}</span>
                        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          {mealCalories} cal ({percentage}%)
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '12px', 
                        background: '#e0e0e0', 
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${percentage}%`,
                          height: '100%',
                          background: '#4CAF50',
                          borderRadius: '6px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Plan */}
            <h3 style={{ color: '#333', marginBottom: '1rem' }}>Your Action Plan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {dietPlan.tips.map((tip, index) => (
                <div key={index} style={{ 
                  padding: '1.2rem', 
                  background: 'white', 
                  border: '2px solid #e8f5e8',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    background: '#4CAF50', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ color: '#666', lineHeight: '1.5' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized Health Tips */}
        <div className="card">
          <h2 style={{ color: '#2e7d32', marginBottom: '1.5rem' }}>Your Personalized Health Strategy</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {healthTips.map((category, index) => (
              <div key={index} style={{ 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ color: '#2e7d32', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {category.icon}
                  </span>
                  {category.category}
                </h4>
                <ul style={{ color: '#666', paddingLeft: '1.2rem', margin: 0 }}>
                  {category.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} style={{ marginBottom: '0.8rem', lineHeight: '1.5', fontSize: '0.95rem' }}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tips;