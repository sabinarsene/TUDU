import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AUTH_ENDPOINT = `${API_URL}/auth`;

// Setarea token-ului în header-ul de autorizare
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Păstrăm și x-auth-token pentru compatibilitate
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Înregistrare utilizator
export const register = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_ENDPOINT}/register`, userData);
    
    // Salvare token în localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Setare token în header
    setAuthToken(response.data.token);
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login utilizator
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${AUTH_ENDPOINT}/login`, { email, password });
    
    // Salvare token în localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Setare token în header
    setAuthToken(response.data.token);
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Logout utilizator
export const logout = () => {
  // Ștergere token din localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Ștergere token din header
  setAuthToken(null);
};

// Verificare dacă utilizatorul este autentificat
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Obținere profil utilizator
export const getUserProfile = async () => {
  try {
    setAuthToken(localStorage.getItem('token'));
    const response = await axios.get(`${AUTH_ENDPOINT}/profile`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
