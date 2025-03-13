import { API_BASE_URL } from '../config/api';

// Use consistent API URL format
const API_ENDPOINT = `${API_BASE_URL}/api`;

/**
 * Add a service to favorites
 * @param {string} serviceId - ID of the service to favorite
 * @returns {Promise<Object>} Response from the server
 */
export const addServiceToFavorites = async (serviceId) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/services/${serviceId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding service to favorites:', error);
    throw error;
  }
};

/**
 * Remove a service from favorites
 * @param {string} serviceId - ID of the service to unfavorite
 * @returns {Promise<Object>} Response from the server
 */
export const removeServiceFromFavorites = async (serviceId) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/services/${serviceId}/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error removing service from favorites:', error);
    throw error;
  }
};

/**
 * Add a request to favorites
 * @param {string} requestId - ID of the request to favorite
 * @returns {Promise<Object>} Response from the server
 */
export const addRequestToFavorites = async (requestId) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/requests/${requestId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding request to favorites:', error);
    throw error;
  }
};

/**
 * Remove a request from favorites
 * @param {string} requestId - ID of the request to unfavorite
 * @returns {Promise<Object>} Response from the server
 */
export const removeRequestFromFavorites = async (requestId) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/requests/${requestId}/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error removing request from favorites:', error);
    throw error;
  }
};

/**
 * Check if a service is favorited by the current user
 * @param {string} serviceId - ID of the service to check
 * @returns {Promise<boolean>} Whether the service is favorited
 */
export const isServiceFavorited = async (serviceId) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/services/${serviceId}/favorite`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check service favorite status');
    }

    const data = await response.json();
    return data.isFavorited;
  } catch (error) {
    console.error('Error checking service favorite status:', error);
    throw error;
  }
};

/**
 * Check if a request is favorited by the current user
 * @param {string} requestId - ID of the request to check
 * @returns {Promise<boolean>} Whether the request is favorited
 */
export const isRequestFavorited = async (requestId) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/requests/${requestId}/favorite`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check request favorite status');
    }

    const data = await response.json();
    return data.isFavorited;
  } catch (error) {
    console.error('Error checking request favorite status:', error);
    throw error;
  }
};

/**
 * Get all favorite services for the current user
 * @returns {Promise<Array>} List of favorited services
 */
export const getFavoriteServices = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/profile/services/favorites`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching favorite services:', error);
    throw error;
  }
};

/**
 * Get user's favorite requests
 * @returns {Promise<Array>} List of favorite requests
 */
export const getFavoriteRequests = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/requests/favorites`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching favorite requests:', error);
    throw error;
  }
}; 