const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

/**
 * Add a service to favorites
 * @param {string} serviceId - ID of the service to favorite
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response from the server
 */
export const addServiceToFavorites = async (serviceId, token) => {
  try {
    const response = await fetch(`${API_URL}/services/${serviceId}/favorite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add service to favorites');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding service to favorites:', error);
    throw error;
  }
};

/**
 * Remove a service from favorites
 * @param {string} serviceId - ID of the service to unfavorite
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response from the server
 */
export const removeServiceFromFavorites = async (serviceId, token) => {
  try {
    const response = await fetch(`${API_URL}/services/${serviceId}/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove service from favorites');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing service from favorites:', error);
    throw error;
  }
};

/**
 * Add a request to favorites
 * @param {string} requestId - ID of the request to favorite
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response from the server
 */
export const addRequestToFavorites = async (requestId, token) => {
  try {
    const response = await fetch(`${API_URL}/requests/${requestId}/favorite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add request to favorites');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding request to favorites:', error);
    throw error;
  }
};

/**
 * Remove a request from favorites
 * @param {string} requestId - ID of the request to unfavorite
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response from the server
 */
export const removeRequestFromFavorites = async (requestId, token) => {
  try {
    const response = await fetch(`${API_URL}/requests/${requestId}/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove request from favorites');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing request from favorites:', error);
    throw error;
  }
};

/**
 * Check if a service is favorited by the current user
 * @param {string} serviceId - ID of the service to check
 * @param {string} token - Authentication token
 * @returns {Promise<boolean>} Whether the service is favorited
 */
export const isServiceFavorited = async (serviceId, token) => {
  try {
    const response = await fetch(`${API_URL}/services/${serviceId}/favorite`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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
 * @param {string} token - Authentication token
 * @returns {Promise<boolean>} Whether the request is favorited
 */
export const isRequestFavorited = async (requestId, token) => {
  try {
    const response = await fetch(`${API_URL}/requests/${requestId}/favorite`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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
 * @param {string} token - Authentication token
 * @returns {Promise<Array>} List of favorited services
 */
export const getFavoriteServices = async (token) => {
  try {
    console.log('Fetching favorite services with token:', token ? 'Token provided' : 'No token');
    
    if (!token) {
      console.error('No authentication token provided');
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/profile/services/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: 'Failed to parse error response' 
      }));
      
      console.error('Error response from server:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      throw new Error(errorData.message || 'Failed to fetch favorite services');
    }

    const data = await response.json();
    console.log('Favorite services fetched successfully:', data);
    return data.services || [];
  } catch (error) {
    console.error('Error fetching favorite services:', error);
    throw error;
  }
};

/**
 * Get user's favorite requests
 * @param {string} token - Authentication token
 * @returns {Promise<Array>} List of favorite requests
 */
export const getFavoriteRequests = async (token) => {
  try {
    const response = await fetch(`${API_URL}/requests/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch favorite requests');
    }

    const data = await response.json();
    return data.requests;
  } catch (error) {
    console.error('Error fetching favorite requests:', error);
    throw error;
  }
}; 