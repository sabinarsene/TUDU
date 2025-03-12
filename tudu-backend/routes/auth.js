const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register user (Sign Up)
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', {
      ...req.body,
      password: '[REDACTED]'
    });

    const { firstName, lastName, email, password } = req.body;

    // Validate input
    const missingFields = {
      firstName: !firstName,
      lastName: !lastName,
      email: !email,
      password: !password
    };

    if (Object.values(missingFields).some(field => field)) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        missing: missingFields
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ 
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    console.log('Checking for existing user with email:', email);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      throw checkError;
    }

    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ 
        message: 'Email already exists'
      });
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: hashedPassword,
      is_provider: false,
      rating: 0,
      review_count: 0,
      member_since: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to insert new user:', {
      ...userData,
      password: '[REDACTED]'
    });

    // Insert user into database
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([userData])
      .select('id, first_name, last_name, email, member_since')
      .single();

    if (insertError) {
      console.error('Error inserting new user:', insertError);
      throw insertError;
    }

    if (!newUser || !newUser.id) {
      console.error('User created but no ID returned');
      throw new Error('Failed to create user account');
    }

    console.log('User successfully created:', {
      id: newUser.id,
      email: newUser.email
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send success response
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        memberSince: newUser.member_since
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Supabase errors
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        message: 'Email already exists'
      });
    }
    
    if (error.code === '23502') { // Not null violation
      return res.status(400).json({ 
        message: 'Missing required fields'
      });
    }
    
    // Handle other database errors
    if (error.code) {
      return res.status(400).json({ 
        message: 'Database error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        profileImage: user.profile_image,
        isProvider: user.is_provider,
        occupation: user.occupation,
        education: user.education,
        age: user.age,
        location: user.location,
        bio: user.bio,
        specialization: user.specialization,
        experience: user.experience,
        languages: user.languages,
        availability: user.availability,
        rating: user.rating,
        reviewCount: user.review_count,
        memberSince: user.member_since
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route to get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, 
        first_name, 
        last_name, 
        email, 
        profile_image,
        is_provider,
        occupation,
        education,
        age,
        location,
        bio,
        specialization,
        experience,
        languages,
        availability,
        rating,
        review_count,
        member_since
      `)
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      profileImage: user.profile_image,
      isProvider: user.is_provider,
      occupation: user.occupation,
      education: user.education,
      age: user.age,
      location: user.location,
      bio: user.bio,
      specialization: user.specialization,
      experience: user.experience,
      languages: user.languages,
      availability: user.availability,
      rating: user.rating,
      reviewCount: user.review_count,
      memberSince: user.member_since
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
