import axios from 'axios';

// Use absolute URL for development
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api' 
  : '/api';

// Create axios instance with better error handling
const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  signup: (userData) => API.post('/auth/signup', userData),
};

export const userAPI = {
  updatePersonalInfo: (data) => API.put('/users/personal-info', data),
  getProfile: () => API.get('/users/profile'),
  deleteAccount: () => API.delete('/users/account'), // Add this line
};

export const mealAPI = {
  addMeal: (data) => API.post('/meals', data),
  getMeals: (date) => API.get(`/meals?date=${date}`),
  getWeeklyData: () => API.get('/meals/weekly'),
  getDebug: () => API.get('/meals/debug'), // Add this line
};

export const predictorAPI = {
  predictCalories: (data) => API.post('/predictor/calories', data),
};

// Test backend connection
export const testBackend = () => API.get('/test');

export default API;