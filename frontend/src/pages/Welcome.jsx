import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #7ecc80ff 0%, #45a049 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="card" style={{ 
        textAlign: 'center', 
        padding: '3rem',
        maxWidth: '500px'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <img 
            src="src/assets/logo.png" // Update this path to your actual logo file
            alt="NutriTrack Logo" 
            style={{ 
              maxWidth: '120px', 
              height: 'auto',
              margin: '0 auto'
            }}
          />
        </div>
        
        <h1 style={{ 
          color: '#4CAF50', 
          marginBottom: '1rem',
          fontSize: '2.5rem'
        }}>
          Welcome to NutriTrack
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '2rem',
          color: '#666'
        }}>
          Track your nutrition, achieve your health goals
        </p>
        <Link to="/login" className="btn btn-primary" style={{
          display: 'inline-block',
          textDecoration: 'none',
          fontSize: '1.1rem',
          padding: '12px 30px'
        }}>
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Welcome;