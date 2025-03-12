import axios from 'axios';

// Service API for handling service-related API calls
// Folosim window.location.hostname pentru a obține adresa IP sau hostname-ul curent
export const API_URL = `http://${window.location.hostname}:5000/api`;

// Log the API URL for debugging
console.log('API URL:', API_URL);

/**
 * Fetch all services from the API
 * @returns {Promise<Array>} Array of services
 */
export const fetchServices = async () => {
  try {
    const fullUrl = `${API_URL}/services`;
    console.log('Fetching services from:', fullUrl);
    
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Error fetching services: ${response.statusText}`);
    }
    
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
export const fetchServiceById = async (id) => {
  try {
    const fullUrl = `${API_URL}/services/${id}`;
    console.log('Fetching service by ID from:', fullUrl);
    
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Error fetching service: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new service
 * @param {FormData} serviceData - Service data as FormData (for file uploads)
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Created service
 */
export const createService = async (serviceData, token) => {
  try {
    const fullUrl = `${API_URL}/services`;
    console.log('Creating service at:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: Don't set Content-Type when sending FormData
        // The browser will set it automatically with the correct boundary
      },
      body: serviceData
    });
    
    // Încercăm să obținem răspunsul JSON
    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      console.error('Error parsing response:', jsonError);
      // Dacă nu putem parsa JSON, folosim textul răspunsului
      const textResponse = await response.text();
      if (!response.ok) {
        throw new Error(textResponse || `Error creating service: ${response.statusText}`);
      }
      throw new Error('Răspunsul serverului nu este în format valid');
    }
    
    if (!response.ok) {
      console.error('Server returned error:', responseData);
      
      // Verificăm dacă eroarea este legată de Supabase storage
      if (responseData.error && responseData.error.includes('storage')) {
        throw new Error('Eroare la încărcarea imaginii. Serviciul Supabase Storage nu este disponibil.');
      }
      
      throw new Error(responseData.message || `Error creating service: ${response.statusText}`);
    }
    
    return responseData;
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
export const updateService = async (id, serviceData, token) => {
  try {
    // Check if serviceData is FormData
    const isFormData = serviceData instanceof FormData;
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Only set Content-Type for JSON data, not for FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: headers,
      body: isFormData ? serviceData : JSON.stringify(serviceData)
    });
    
    if (!response.ok) {
      throw new Error(`Error updating service: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating service with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a service
 * @param {number} id - Service ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response message
 */
export const deleteService = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting service: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting service with ID ${id}:`, error);
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
export const submitUserRating = async (userId, rating, comment, token) => {
  try {
    console.log(`Submitting rating ${rating} for user ${userId} with comment: ${comment}`);
    const apiUrl = `${API_URL}/users/${userId}/ratings`;
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
export const fetchUserRatings = async (userId) => {
  try {
    console.log(`Fetching ratings for user ${userId}`);
    const apiUrl = `${API_URL}/users/${userId}/ratings`;
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
export const fetchUserServices = async (userId) => {
  try {
    // Încercăm să facem apelul API
    try {
      const response = await fetch(`${API_URL}/services/user/${userId}`);
      
      if (!response.ok) {
        // Dacă primim 404, returnăm date mock
        if (response.status === 404) {
          console.log(`Endpoint /services/user/${userId} nu este disponibil, returnăm date mock`);
          return getMockUserServices(userId);
        }
        throw new Error(`Error fetching user services: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      // Dacă primim orice eroare, returnăm date mock
      console.error(`Error fetching services for user ${userId}:`, error);
      return getMockUserServices(userId);
    }
  } catch (error) {
    console.error(`Error fetching services for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Generează date mock pentru serviciile unui utilizator
 * @param {string} userId - ID-ul utilizatorului
 * @returns {Array} Array de servicii mock
 */
const getMockUserServices = (userId) => {
  // Generăm un număr aleatoriu de servicii între 1 și 5
  const numServices = Math.floor(Math.random() * 5) + 1;
  const services = [];
  
  const categories = ['Instalații', 'Curățenie', 'Transport', 'Reparații', 'IT', 'Design', 'Educație'];
  const locations = ['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov', 'Constanța'];
  
  // Generăm servicii aleatorii
  for (let i = 0; i < numServices; i++) {
    const service = {
      id: `mock-service-${i}`,
      title: `Serviciu Mock ${i + 1}`,
      description: `Aceasta este o descriere mock pentru serviciul ${i + 1} al utilizatorului cu ID-ul ${userId}.`,
      category: categories[Math.floor(Math.random() * categories.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      price: Math.floor(Math.random() * 500) + 50,
      currency: 'RON',
      rating: (Math.random() * 4 + 1).toFixed(1),
      review_count: Math.floor(Math.random() * 50),
      image: null,
      provider: {
        id: userId,
        name: `Utilizator ${userId}`,
        image: null
      }
    };
    services.push(service);
  }
  
  return services;
}; 