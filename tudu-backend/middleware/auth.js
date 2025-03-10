const jwt = require('jsonwebtoken');

// Middleware pentru verificarea autentificării
const auth = (req, res, next) => {
  // Obține token-ul din header-ul Authorization
  const authHeader = req.header('Authorization');
  
  // Verifică dacă există header-ul Authorization și dacă începe cu "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Verifică și header-ul x-auth-token pentru compatibilitate
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } else {
    // Extrage token-ul din header-ul Authorization
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  }
};

module.exports = auth; 