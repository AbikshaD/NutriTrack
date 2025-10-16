import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav style={{ 
      background: '#4CAF50', 
      padding: '1rem 0',
      color: 'white',
      marginBottom: '2rem'
    }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Link to="/home" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            NutriTrack
          </Link>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/home" style={{ color: 'white', textDecoration: 'none' }}>
              Home
            </Link>
            <Link to="/predictor" style={{ color: 'white', textDecoration: 'none' }}>
              Predictor
            </Link>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>
              Profile
            </Link>
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'transparent', 
                border: '1px solid white', 
                color: 'white', 
                padding: '5px 10px', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;