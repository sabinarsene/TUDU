const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const requestRoutes = require('./routes/requests');
const profileRoutes = require('./routes/profile');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['x-auth-token'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure required environment variables are set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// Create upload directories
const createUploadDirs = () => {
  // Păstrăm doar directoarele necesare pentru alte funcționalități, nu pentru imagini
  const dirs = [
    'public'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating directory: ${fullPath}`);
      fs.mkdirSync(fullPath, { recursive: true });
    } else {
      console.log(`Directory already exists: ${fullPath}`);
    }
  });
};

// Ensure upload directories exist
createUploadDirs();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/profile', profileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack trace:', err.stack);
  
  // Handle specific types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error',
      errors: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      message: 'Invalid token or no token provided'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err.details || err
    } : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});
