import axios from 'axios';

// Folosim window.location.hostname pentru a obține adresa IP sau hostname-ul curent
const API_URL = `http://${window.location.hostname}:5000/api`;
const AUTH_ENDPOINT = `${API_URL}/auth`;

console.log('Auth API URL:', API_URL);

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
    console.error('Register error:', error);
    
    // Gestionare îmbunătățită a erorilor
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Eroare la înregistrare');
    } else if (error.request) {
      // Cererea a fost făcută dar nu s-a primit răspuns
      throw new Error('Nu s-a putut contacta serverul. Verificați conexiunea la internet.');
    } else {
      // Eroare la configurarea cererii
      throw new Error(error.message || 'A apărut o eroare la înregistrare.');
    }
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
    console.error('Login error:', error);
    
    // Gestionare îmbunătățită a erorilor
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Eroare la autentificare');
    } else if (error.request) {
      // Cererea a fost făcută dar nu s-a primit răspuns
      throw new Error('Nu s-a putut contacta serverul. Verificați conexiunea la internet.');
    } else {
      // Eroare la configurarea cererii
      throw new Error(error.message || 'A apărut o eroare la autentificare.');
    }
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
    console.error('Get profile error:', error);
    
    // Gestionare îmbunătățită a erorilor
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Eroare la obținerea profilului');
    } else if (error.request) {
      // Cererea a fost făcută dar nu s-a primit răspuns
      throw new Error('Nu s-a putut contacta serverul. Verificați conexiunea la internet.');
    } else {
      // Eroare la configurarea cererii
      throw new Error(error.message || 'A apărut o eroare la obținerea profilului.');
    }
  }
};
