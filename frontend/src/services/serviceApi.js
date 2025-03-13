import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Use consistent API URL format
const API_ENDPOINT = `${API_BASE_URL}/api/services`;

// Log the API URL for debugging
console.log('API URL:', API_ENDPOINT);

/**
 * Fetch all services from the API
 * @returns {Promise<Array>} Array of services
 */
const getServices = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const fullUrl = `${API_ENDPOINT}${queryParams ? `?${queryParams}` : ''}`;
    const response = await fetch(fullUrl);
    return await response.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

/**
 * Fetch a single service by ID
 * @param {number} id - Service ID
 * @returns {Promise<Object>} Service object
 */
const getServiceById = async (id) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

/**
 * Create a new service
 * @param {FormData} serviceData - Service data as FormData (for file uploads)
 * @returns {Promise<Object>} Created service
 */
const createService = async (serviceData) => {
  try {
    // Log the raw service data for debugging
    console.log('Raw service data fields:', Array.from(serviceData.entries()));

    const formattedData = new FormData();
    
    // Add basic fields
    const fields = ['title', 'category', 'price', 'currency', 'location', 'description'];
    fields.forEach(field => {
      const value = serviceData.get(field);
      if (value) {
        formattedData.append(field, value.trim());
      }
    });

    // Handle images
    const images = serviceData.getAll('images');
    if (images && images.length > 0) {
      console.log('Processing images:', images.length, 'files');
      images.forEach((image, index) => {
        console.log(`Image ${index + 1}:`, image.name, image.type, image.size);
        formattedData.append('image', image); // Changed to 'image' as per Multer config
      });
    }

    // Log the formatted data for debugging
    console.log('Formatted form data fields:', Array.from(formattedData.entries()));

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nu ești autentificat');
    }

    console.log('Sending request to:', API_ENDPOINT);
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formattedData
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      let errorMessage = 'Failed to create service';
      try {
        const errorData = await response.json();
        console.error('Server error details:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Service created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

/**
 * Update an existing service
 * @param {number} id - Service ID
 * @param {Object|FormData} serviceData - Updated service data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Updated service
 */
const updateService = async (id, serviceData) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(serviceData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

/**
 * Delete a service
 * @param {number} id - Service ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response message
 */
const deleteService = async (id) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

/**
 * Submit a rating for a user
 * @param {string} userId - ID of the user being rated
 * @param {number} rating - Rating value (1-5)
 * @param {string} comment - Optional comment with the rating
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response with the updated rating information
 */
const submitUserRating = async (userId, rating, comment, token) => {
  try {
    console.log(`Submitting rating ${rating} for user ${userId} with comment: ${comment}`);
    const apiUrl = `${API_BASE_URL}/api/users/${userId}/ratings`;
    console.log('API URL:', apiUrl);
    
    // Verificăm dacă avem token
    if (!token) {
      console.error('No token provided');
      throw new Error('Nu ești autentificat');
    }
    
    console.log('Using token:', token);
    
    // Configurăm axios cu timeout și headers
    const axiosInstance = axios.create({
      timeout: 10000, // 10 secunde timeout
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token // pentru compatibilitate
      }
    });
    
    console.log('Request headers:', axiosInstance.defaults.headers);
    
    const response = await axiosInstance.post(apiUrl, {
      rating,
      comment
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Rating submitted successfully:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error submitting rating for user ${userId}:`, error);
    
    if (error.response) {
      // Serverul a răspuns cu un status code în afara intervalului 2xx
      console.error('Server error response:', error.response.data);
      const errorMessage = error.response.data.message || `Error submitting rating: ${error.response.statusText}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Cererea a fost făcută dar nu s-a primit răspuns
      console.error('No response received:', error.request);
      throw new Error('Nu s-a putut contacta serverul. Verificați conexiunea la internet.');
    } else {
      // Ceva s-a întâmplat la configurarea cererii
      console.error('Request configuration error:', error.message);
      throw error;
    }
  }
};

/**
 * Fetch ratings for a user
 * @param {string} userId - ID of the user
 * @returns {Promise<Object>} Object with ratings array
 */
const fetchUserRatings = async (userId) => {
  try {
    console.log(`Fetching ratings for user ${userId}`);
    const apiUrl = `${API_BASE_URL}/api/users/${userId}/ratings`;
    console.log('API URL:', apiUrl);
    
    // Adăugăm un timeout pentru a evita blocarea UI-ului
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secunde timeout
    
    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers]));
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Endpoint /users/${userId}/ratings nu este disponibil sau utilizatorul nu are evaluări`);
          return { ratings: [], averageRating: 0, reviewCount: 0 };
        }
        
        // Încercăm să obținem detalii despre eroare
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          throw new Error(errorData.message || `Error fetching ratings: ${response.statusText}`);
        } catch (jsonError) {
          console.error('Could not parse error response:', jsonError);
          throw new Error(`Error fetching ratings: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Ratings fetched successfully:', data);
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out after 10 seconds');
        throw new Error('Cererea a expirat. Serverul nu a răspuns în timp util.');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error(`Error fetching ratings for user ${userId}:`, error);
    
    // Returnăm un obiect gol în loc să aruncăm eroarea
    // pentru a permite componentei să afișeze un mesaj de eroare
    return { ratings: [], averageRating: 0, reviewCount: 0 };
  }
};

/**
 * Fetch services for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of services
 */
const getUserServices = async (userId) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/user/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user services:', error);
    throw error;
  }
};

// Single export statement at the end of the file
export {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getUserServices,
  submitUserRating,
  fetchUserRatings
}; 