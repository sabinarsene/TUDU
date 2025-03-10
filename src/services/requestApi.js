// Request API for handling request-related API calls
const API_URL = 'http://localhost:5000/api';

// Log the API URL for debugging
console.log('Request API URL:', API_URL);

/**
 * Fetch all requests from the API
 * @returns {Promise<Array>} Array of requests
 */
export const fetchRequests = async () => {
  try {
    const fullUrl = `${API_URL}/requests`;
    console.log('Fetching requests from:', fullUrl);
    
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Error fetching requests: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

/**
 * Fetch a single request by ID
 * @param {number} id - Request ID
 * @returns {Promise<Object>} Request object
 */
export const fetchRequestById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/requests/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching request: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching request with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new request
 * @param {FormData} requestData - Request data as FormData (for file uploads)
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Created request
 */
export const createRequest = async (requestData, token) => {
  try {
    // Verificăm că avem token
    if (!token) {
      throw new Error('Nu ești autentificat');
    }

    // Verificăm că avem toate câmpurile obligatorii
    const title = requestData.get('title');
    const category = requestData.get('category');
    const description = requestData.get('description');
    const location = requestData.get('location');

    if (!title || !title.trim()) {
      throw new Error('Titlul este obligatoriu');
    }

    if (!category || !category.trim()) {
      throw new Error('Categoria este obligatorie');
    }

    if (!description || !description.trim()) {
      throw new Error('Descrierea este obligatorie');
    }

    if (!location || !location.trim()) {
      throw new Error('Locația este obligatorie');
    }

    // Facem request-ul către server
    const response = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: requestData
    });

    // Verificăm răspunsul
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || 'A apărut o eroare la crearea cererii';
      } catch (e) {
        errorMessage = await response.text() || 'A apărut o eroare la crearea cererii';
      }
      throw new Error(errorMessage);
    }

    // Returnăm datele
    return await response.json();
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

/**
 * Update an existing request
 * @param {number} id - Request ID
 * @param {Object} requestData - Updated request data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Updated request
 */
export const updateRequest = async (id, requestData, token) => {
  try {
    // Verificăm dacă requestData este FormData sau obiect normal
    const isFormData = requestData instanceof FormData;
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Adăugăm Content-Type doar dacă nu este FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_URL}/requests/${id}`, {
      method: 'PUT',
      headers: headers,
      body: isFormData ? requestData : JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`Error updating request: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating request with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a request
 * @param {number} id - Request ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response message
 */
export const deleteRequest = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/requests/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting request: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting request with ID ${id}:`, error);
    throw error;
  }
}; 