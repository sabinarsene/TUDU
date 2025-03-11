const axios = require('axios');

// URL-ul API-ului
const API_URL = 'http://localhost:5000/api';

// Funcție pentru a testa endpoint-ul GET /users/:userId/ratings
async function testGetRatings(userId) {
  try {
    console.log(`Testare GET /users/${userId}/ratings...`);
    
    const response = await axios.get(`${API_URL}/users/${userId}/ratings`);
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Eroare la testarea endpoint-ului GET /users/:userId/ratings:');
    
    if (error.response) {
      // Serverul a răspuns cu un status diferit de 2xx
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // Cererea a fost făcută dar nu s-a primit răspuns
      console.error('Nu s-a primit răspuns de la server.');
      console.error('Request:', error.request);
    } else {
      // Eroare la configurarea cererii
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

// Funcție pentru a testa endpoint-ul POST /users/:userId/ratings
async function testPostRating(userId, rating, comment, token) {
  try {
    console.log(`Testare POST /users/${userId}/ratings...`);
    
    const response = await axios.post(
      `${API_URL}/users/${userId}/ratings`,
      { rating, comment },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Eroare la testarea endpoint-ului POST /users/:userId/ratings:');
    
    if (error.response) {
      // Serverul a răspuns cu un status diferit de 2xx
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // Cererea a fost făcută dar nu s-a primit răspuns
      console.error('Nu s-a primit răspuns de la server.');
      console.error('Request:', error.request);
    } else {
      // Eroare la configurarea cererii
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

// Funcție pentru a rula testele
async function runTests() {
  // Testăm endpoint-ul GET /users/:userId/ratings
  const userId = 1; // Înlocuiește cu un ID valid
  await testGetRatings(userId);
  
  // Pentru a testa POST, avem nevoie de un token valid
  // Acest test va fi comentat până când avem un token valid
  /*
  const token = 'your-token-here';
  const rating = 5;
  const comment = 'Acesta este un test.';
  await testPostRating(userId, rating, comment, token);
  */
}

// Rulăm testele
runTests()
  .then(() => {
    console.log('Testele s-au finalizat.');
  })
  .catch(error => {
    console.error('Eroare la rularea testelor:', error);
  }); 