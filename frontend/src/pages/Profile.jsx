import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Pre-fill form with existing user data
      setFormData({
        name: user.personalInfo?.name || '',
        age: user.personalInfo?.age || '',
        height: user.personalInfo?.height || '',
        weight: user.personalInfo?.weight || '',
        gender: user.personalInfo?.gender || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name?.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (!formData.age || formData.age < 1 || formData.age > 120) {
      setError('Please enter a valid age (1-120)');
      setLoading(false);
      return;
    }

    if (!formData.height || formData.height < 50 || formData.height > 250) {
      setError('Please enter a valid height (50-250 cm)');
      setLoading(false);
      return;
    }

    if (!formData.weight || formData.weight < 20 || formData.weight > 300) {
      setError('Please enter a valid weight (20-300 kg)');
      setLoading(false);
      return;
    }

    if (!formData.gender) {
      setError('Please select your gender');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting profile data:', formData);
      
      const response = await userAPI.updatePersonalInfo({
        name: formData.name.trim(),
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        gender: formData.gender
      });
      
      console.log('Profile update response:', response);
      
      setSuccess('Profile updated successfully!');
      
      // Refresh the page after 2 seconds to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      // We need to create this API endpoint in the backend
      await userAPI.deleteAccount();
      
      // Clear local storage and redirect
      localStorage.removeItem('token');
      alert('Your account has been permanently deleted.');
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage = error.response?.data?.message || 
                          'Failed to delete account. Please try again.';
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDeleteConfirm('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>My Profile</h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
              Update your personal information and track your health metrics
            </p>

            {error && (
              <div style={{ 
                background: '#ffebee', 
                color: '#c62828', 
                padding: '12px', 
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #ffcdd2'
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {success && (
              <div style={{ 
                background: '#e8f5e8', 
                color: '#2e7d32', 
                padding: '12px', 
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #c8e6c9'
              }}>
                <strong>Success:</strong> {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    style={{ background: '#f5f5f5', color: '#666' }}
                  />
                  <small style={{ color: '#999' }}>Email cannot be changed</small>
                </div>
                
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={user.username || ''}
                    disabled
                    style={{ background: '#f5f5f5', color: '#666' }}
                  />
                  <small style={{ color: '#999' }}>Username cannot be changed</small>
                </div>
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age"
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Height (cm) *</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height"
                    min="50"
                    max="250"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Weight (kg) *</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Weight"
                    min="20"
                    max="300"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => navigate('/home')}
                  className="btn"
                  style={{ 
                    flex: 1, 
                    background: '#6c757d', 
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Back to Home
                </button>
              </div>
            </form>

            {/* BMI Calculator Section */}
            {formData.height && formData.weight && (
              <div style={{ 
                marginTop: '2rem', 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Health Metrics</h4>
                
                {(() => {
                  const heightInMeters = parseFloat(formData.height) / 100;
                  const weightNum = parseFloat(formData.weight);
                  const bmi = weightNum / (heightInMeters * heightInMeters);
                  let bmiCategory = '';
                  
                  if (bmi < 18.5) bmiCategory = 'Underweight';
                  else if (bmi < 25) bmiCategory = 'Normal weight';
                  else if (bmi < 30) bmiCategory = 'Overweight';
                  else bmiCategory = 'Obese';

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <strong>BMI:</strong> {bmi.toFixed(1)}
                      </div>
                      <div>
                        <strong>Category:</strong> {bmiCategory}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Account Actions Section */}
            <div style={{ 
              marginTop: '2rem', 
              paddingTop: '2rem', 
              borderTop: '1px solid #eee'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Account Actions</h4>
              
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    background: 'transparent', 
                    color: '#dc3545', 
                    border: '1px solid #dc3545',
                    padding: '10px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>

                <button 
                  onClick={() => setShowDeleteModal(true)}
                  style={{ 
                    background: 'transparent', 
                    color: '#dc3545', 
                    border: '1px solid #dc3545',
                    padding: '10px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Delete Account Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ Delete Account</h3>
            
            <p style={{ marginBottom: '1rem' }}>
              This action <strong>cannot be undone</strong>. This will permanently delete your account and all your data including:
            </p>
            
            <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
              <li>Your personal information</li>
              <li>All your meal history</li>
              <li>Your nutrition data</li>
              <li>Your progress tracking</li>
            </ul>

            <p style={{ marginBottom: '1rem' }}>
              <strong>Type "DELETE"</strong> in the box below to confirm:
            </p>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #dc3545',
                borderRadius: '5px',
                marginBottom: '1.5rem',
                fontSize: '16px'
              }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                style={{
                  flex: 1,
                  background: deleteConfirm === 'DELETE' ? '#dc3545' : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '5px',
                  cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                  setError('');
                }}
                style={{
                  flex: 1,
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;