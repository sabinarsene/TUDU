// Service API for handling service-related API calls
const API_URL = 'http://localhost:5000/api';

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
    
    if (!response.ok) {
      throw new Error(`Error creating service: ${response.statusText}`);
    }
    
    return await response.json();
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