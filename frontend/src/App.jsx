import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Predictor from './pages/Predictor';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: '#f5f5f5'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #4CAF50',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ marginTop: '20px', color: '#666' }}>Loading NutriTrack...</p>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

const ConnectionError = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: '#fff3e0',
    padding: '20px',
    textAlign: 'center'
  }}>
    <h2 style={{ color: '#e65100', marginBottom: '10px' }}>⚠️ Connection Error</h2>
    <p style={{ color: '#e65100', marginBottom: '20px' }}>
      Cannot connect to the server. Please make sure the backend is running on port 5000.
    </p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        padding: '10px 20px',
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      Retry Connection
    </button>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading, backendConnected } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!backendConnected) {
    return <ConnectionError />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading, backendConnected } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!backendConnected) {
    return <ConnectionError />;
  }
  
  return !user ? children : <Navigate to="/home" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Welcome />} />
            
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            
            <Route path="/predictor" element={
              <ProtectedRoute>
                <Predictor />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;