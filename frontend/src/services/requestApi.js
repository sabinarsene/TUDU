import { API_BASE_URL } from '../config/api';

// Use consistent API URL format
const API_ENDPOINT = `${API_BASE_URL}/api/requests`;

// Get all requests
export const getRequests = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const fullUrl = `${API_ENDPOINT}${queryParams ? `?${queryParams}` : ''}`;
    const response = await fetch(fullUrl);
    return await response.json();
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

// Get request by ID
export const getRequestById = async (id) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching request:', error);
    throw error;
  }
};

// Create new request
export const createRequest = async (requestData) => {
  try {
    const formattedData = {
      title: requestData.get('title'),
      category: requestData.get('category'),
      description: requestData.get('description'),
      budget: parseFloat(requestData.get('budget')),
      currency: requestData.get('currency'),
      location: requestData.get('location'),
      deadline: requestData.get('deadline'),
      contactPreference: requestData.get('contactPreference')
    };

    console.log('Creating request with formatted data:', formattedData);

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nu ești autentificat');
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formattedData)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create request';
      try {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Request created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

// Update request
export const updateRequest = async (id, requestData) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating request:', error);
    throw error;
  }
};

// Delete request
export const deleteRequest = async (id) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};

// Get user requests
export const getUserRequests = async (userId) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/user/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user requests:', error);
    throw error;
  }
};

/**
 * Fetch all requests from the API
 * @returns {Promise<Array>} Array of requests
 */
export const fetchRequests = async () => {
  try {
    const fullUrl = `${API_ENDPOINT}`;
    console.log('Fetching requests from:', fullUrl);
    
    const response = await fetch(fullUrl);
    
    // Încearcă să obții răspunsul JSON, chiar dacă statusul nu este ok
    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      return [];
    }
    
    if (!response.ok) {
      console.error('Server returned error:', responseData);
      return [];
    }
    
    // Ne asigurăm că returnăm întotdeauna un array
    if (Array.isArray(responseData)) {
      return responseData;
    } else if (responseData && responseData.requests) {
      return responseData.requests;
    } else {
      console.error('Unexpected response format:', responseData);
      return [];
    }
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
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
      const response = await fetch(`${API_ENDPOINT}/user/${userId}`);
      
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