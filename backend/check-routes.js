const express = require('express');
const app = express();

// Importăm rutele
const userRoutes = require('./routes/users');

// Înregistrăm rutele
app.use('/api/users', userRoutes);

// Funcție pentru a afișa toate rutele înregistrate
function listRoutes() {
  console.log('Rute înregistrate:');
  
  // Funcție recursivă pentru a afișa rutele
  function print(path, layer) {
    if (layer.route) {
      layer.route.stack.forEach(print.bind(null, path));
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach(print.bind(null, path + layer.regexp.toString().replace('/^', '').replace('\\/?(?=\\/|$)/i', '')));
    } else if (layer.method) {
      console.log('%s %s', layer.method.toUpperCase(), path + layer.regexp.toString().replace('/^', '').replace('\\/?(?=\\/|$)/i', ''));
    }
  }
  
  app._router.stack.forEach(print.bind(null, ''));
}

// Afișăm toate rutele înregistrate
listRoutes();

// Verificăm specific ruta pentru evaluări
console.log('\nVerificare rută pentru evaluări:');
let found = false;

app._router.stack.forEach(layer => {
  if (layer.name === 'router' && layer.regexp.toString().includes('users')) {
    layer.handle.stack.forEach(route => {
      if (route.route && route.route.path.includes('ratings')) {
        console.log(`Rută găsită: ${route.route.methods} ${route.route.path}`);
        found = true;
      }
    });
  }
});

if (!found) {
  console.log('Ruta pentru evaluări nu a fost găsită!');
}

console.log('\nVerificare completă.'); 