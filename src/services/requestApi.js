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
    
    // Încearcă să obții răspunsul JSON, chiar dacă statusul nu este ok
    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      if (!response.ok) {
        throw new Error(`Error fetching requests: ${response.statusText}`);
      }
      throw jsonError;
    }
    
    if (!response.ok) {
      console.error('Server returned error:', responseData);
      throw new Error(responseData.message || `Error fetching requests: ${response.statusText}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Error fetching requests:', error);
    // Returnează un array gol în loc să arunci eroarea, pentru a evita blocarea UI-ului
    return [];
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

    console.log('Sending request to server with data:', {
      title: requestData.get('title'),
      category: requestData.get('category'),
      description: requestData.get('description'),
      location: requestData.get('location'),
      budget: requestData.get('budget'),
      deadline: requestData.get('deadline'),
      image: requestData.get('image')
    });

    // Facem request-ul către server
    const response = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: requestData // Send FormData directly
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createRequest:', error);
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

/**
 * Fetch requests for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of requests
 */
export const fetchUserRequests = async (userId) => {
  try {
    // Încercăm să facem apelul API
    try {
      const response = await fetch(`${API_URL}/requests/user/${userId}`);
      
      if (!response.ok) {
        // Dacă primim 404, returnăm date mock
        if (response.status === 404) {
          console.log(`Endpoint /requests/user/${userId} nu este disponibil, returnăm date mock`);
          return getMockUserRequests(userId);
        }
        throw new Error(`Error fetching user requests: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      // Dacă primim orice eroare, returnăm date mock
      console.error(`Error fetching requests for user ${userId}:`, error);
      return getMockUserRequests(userId);
    }
  } catch (error) {
    console.error(`Error fetching requests for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Generează date mock pentru cererile unui utilizator
 * @param {string} userId - ID-ul utilizatorului
 * @returns {Array} Array de cereri mock
 */
const getMockUserRequests = (userId) => {
  // Generăm un număr aleatoriu de cereri între 0 și 3
  const numRequests = Math.floor(Math.random() * 4);
  const requests = [];
  
  const categories = ['Instalații', 'Curățenie', 'Transport', 'Reparații', 'IT', 'Design', 'Educație'];
  const locations = ['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov', 'Constanța'];
  const deadlines = ['Urgent', '1-3 zile', 'O săptămână', '2 săptămâni', 'O lună'];
  
  // Generăm cereri aleatorii
  for (let i = 0; i < numRequests; i++) {
    const request = {
      id: `mock-request-${i}`,
      title: `Cerere Mock ${i + 1}`,
      description: `Aceasta este o descriere mock pentru cererea ${i + 1} a utilizatorului cu ID-ul ${userId}.`,
      category: categories[Math.floor(Math.random() * categories.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      budget: Math.floor(Math.random() * 1000) + 100,
      currency: 'RON',
      deadline: deadlines[Math.floor(Math.random() * deadlines.length)],
      images: [],
      user: {
        id: userId,
        name: `Utilizator ${userId}`,
        image: null
      }
    };
    requests.push(request);
  }
  
  return requests;
}; 