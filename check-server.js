const http = require('http');

// URL-ul serverului backend
const serverUrl = 'http://localhost:5000';

// Funcție pentru a verifica dacă serverul este pornit
function checkServer() {
  console.log(`Verificare server la ${serverUrl}...`);
  
  // Facem o cerere HTTP GET la server
  const req = http.get(`${serverUrl}/api`, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    
    // Primim datele
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    // Când am primit toate datele
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        console.log('Răspuns:', parsedData);
        console.log('Serverul este pornit și funcționează corect.');
      } catch (e) {
        console.log('Răspuns (text):', data);
        console.log('Serverul este pornit, dar răspunsul nu este în format JSON.');
      }
    });
  });
  
  // Setăm un timeout pentru cerere
  req.setTimeout(5000, () => {
    req.abort();
    console.error('Timeout la conectarea la server.');
    console.log('Serverul nu răspunde în timp util.');
    console.log('Asigurați-vă că serverul backend rulează pe portul 5000.');
    
    console.log('\nPași pentru a porni serverul:');
    console.log('1. Deschideți un terminal nou');
    console.log('2. Navigați la directorul tudu-backend');
    console.log('3. Rulați comanda: ./start-server.ps1');
  });
  
  req.on('error', (err) => {
    console.error('Eroare la conectarea la server:', err.message);
    console.log('Serverul nu este pornit sau nu este accesibil.');
    console.log('Asigurați-vă că serverul backend rulează pe portul 5000.');
    
    // Verificăm dacă eroarea este de tip ECONNREFUSED
    if (err.code === 'ECONNREFUSED') {
      console.log('\nPași pentru a porni serverul:');
      console.log('1. Deschideți un terminal nou');
      console.log('2. Navigați la directorul tudu-backend');
      console.log('3. Rulați comanda: ./start-server.ps1');
    }
  });
}

// Rulăm verificarea
checkServer(); 