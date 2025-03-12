const express = require('express')
const router = express.Router()
const { supabase } = require('../db')
const { authenticateToken } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Debugging middleware
router.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  console.log('Request method:', req.method);
  next();
});

// Configure multer for file uploads with disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../public/uploads/service-images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `service-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WebP and GIF are allowed.'), false)
    }
  }
})

// Get all services with provider information
router.get('/', async (req, res) => {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        provider:user_id (
          id,
          first_name,
          last_name,
          profile_image,
          rating,
          review_count
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format the response
    const formattedServices = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      currency: service.currency,
      location: service.location,
      image: service.image,
      is_active: service.is_active,
      created_at: service.created_at,
      updated_at: service.updated_at,
      provider: {
        id: service.provider.id,
        name: `${service.provider.first_name} ${service.provider.last_name.charAt(0)}.`,
        image: service.provider.profile_image,
        rating: service.provider.rating,
        reviewCount: service.provider.review_count
      }
    }))
    
    res.json(formattedServices)
  } catch (error) {
    console.error('Error fetching services:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's favorite services
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching favorite services for user:', req.user.id);
    
    // Check if user ID is valid
    if (!req.user || !req.user.id) {
      console.error('Invalid user ID in request:', req.user);
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get favorite service IDs
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorite_services')
      .select('service_id')
      .eq('user_id', req.user.id);
    
    if (favoritesError) {
      console.error('Error fetching favorite services:', favoritesError);
      return res.status(500).json({ 
        message: 'Error fetching favorite services',
        error: favoritesError.message,
        details: favoritesError.details || 'No additional details'
      });
    }
    
    if (!favorites || favorites.length === 0) {
      console.log('No favorite services found for user:', req.user.id);
      return res.json({ services: [] });
    }
    
    console.log(`Found ${favorites.length} favorite services for user:`, req.user.id);
    
    // Get service details
    const serviceIds = favorites.map(fav => fav.service_id);
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select(`
        *,
        provider:provider_id (
          id,
          first_name,
          last_name,
          profile_image,
          rating,
          review_count
        )
      `)
      .in('id', serviceIds)
      .order('created_at', { ascending: false });
    
    if (servicesError) {
      console.error('Error fetching favorite service details:', servicesError);
      return res.status(500).json({ 
        message: 'Error fetching favorite service details',
        error: servicesError.message,
        details: servicesError.details || 'No additional details'
      });
    }
    
    // Check if services exist
    if (!services || services.length === 0) {
      console.log('No service details found for favorite services');
      return res.json({ services: [] });
    }
    
    // Format the response
    const formattedServices = services.map(service => {
      // Check if provider exists
      if (!service.provider) {
        console.warn(`Provider not found for service ${service.id}`);
        return {
          id: service.id,
          title: service.title,
          description: service.description,
          category: service.category,
          price: service.price,
          currency: service.currency,
          location: service.location,
          availability: service.availability,
          image: service.image,
          createdAt: service.created_at,
          provider: {
            id: null,
            name: 'Unknown Provider',
            profileImage: null,
            rating: 0,
            reviewCount: 0
          }
        };
      }
      
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        currency: service.currency,
        location: service.location,
        availability: service.availability,
        image: service.image,
        createdAt: service.created_at,
        provider: {
          id: service.provider.id,
          name: `${service.provider.first_name} ${service.provider.last_name}`,
          profileImage: service.provider.profile_image,
          rating: service.provider.rating,
          reviewCount: service.provider.review_count
        }
      };
    });
    
    console.log(`Successfully formatted ${formattedServices.length} favorite services`);
    res.json({ services: formattedServices });
  } catch (error) {
    console.error('Error fetching favorite services:', error);
    res.status(500).json({ 
      message: 'Error fetching favorite services',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get services by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        provider:user_id (
          id,
          first_name,
          last_name,
          profile_image,
          rating,
          review_count
        )
      `)
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const formattedServices = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      currency: service.currency,
      location: service.location,
      image: service.image,
      rating: service.rating,
      review_count: service.review_count,
      created_at: service.created_at,
      provider: {
        id: service.provider.id,
        name: `${service.provider.first_name} ${service.provider.last_name}`,
        image: service.provider.profile_image,
        rating: service.provider.rating,
        reviewCount: service.provider.review_count
      }
    }))

    res.json(formattedServices)
  } catch (error) {
    console.error('Error fetching services by user ID:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Check if service is favorited
router.get('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: favorite, error } = await supabase
      .from('favorite_services')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('service_id', id)
      .single();
    
    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Error checking service favorite status:', error);
    res.status(500).json({ 
      message: 'Error checking favorite status',
      error: error.message 
    });
  }
});

// Add service to favorites
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('id', id)
      .single();
    
    if (serviceError || !service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorite_services')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('service_id', id)
      .single();
    
    if (existingFavorite) {
      return res.status(400).json({ message: 'Service already in favorites' });
    }
    
    // Add to favorites
    const { data, error } = await supabase
      .from('favorite_services')
      .insert({
        user_id: req.user.id,
        service_id: parseInt(id)
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding service to favorites:', error);
      throw error;
    }
    
    res.status(201).json({
      message: 'Service added to favorites',
      favorite: data
    });
  } catch (error) {
    console.error('Error in favorite service process:', error);
    res.status(500).json({ 
      message: 'Error adding service to favorites',
      error: error.message 
    });
  }
});

// Remove service from favorites
router.delete('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Remove from favorites
    const { error } = await supabase
      .from('favorite_services')
      .delete()
      .eq('user_id', req.user.id)
      .eq('service_id', id);
    
    if (error) {
      console.error('Error removing service from favorites:', error);
      throw error;
    }
    
    res.json({
      message: 'Service removed from favorites'
    });
  } catch (error) {
    console.error('Error in unfavorite service process:', error);
    res.status(500).json({ 
      message: 'Error removing service from favorites',
      error: error.message 
    });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  console.log('Fetching service by ID:', req.params.id);
  try {
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        provider:user_id (
          id,
          first_name,
          last_name,
          profile_image,
          rating,
          review_count,
          member_since
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    if (!service) {
      return res.status(404).json({ message: 'Service not found' })
    }

    const formattedService = {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      currency: service.currency,
      location: service.location,
      image: service.image,
      is_active: service.is_active,
      created_at: service.created_at,
      updated_at: service.updated_at,
      provider: {
        id: service.provider.id,
        name: `${service.provider.first_name} ${service.provider.last_name}`,
        image: service.provider.profile_image,
        rating: service.provider.rating,
        review_count: service.provider.review_count,
        member_since: service.provider.member_since
      }
    }

    console.log('Service fetched successfully');
    res.json(formattedService)
  } catch (error) {
    console.error('Error fetching service:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create a new service
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, price, currency, location } = req.body;
    
    if (!title || !description || !category || !price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let imageUrl = null;
    
    // Process uploaded image if present
    if (req.file) {
      const relativePath = '/uploads/service-images/' + path.basename(req.file.path);
      imageUrl = `${req.protocol}://${req.get('host')}${relativePath}`;
      console.log('Service image uploaded:', imageUrl);
    }

    // Insert the new service
    const { data, error } = await supabase
      .from('services')
      .insert({
        user_id: req.user.id,
        title,
        description,
        category,
        price,
        currency: currency || 'RON',
        location,
        image: imageUrl,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      // Clean up the uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw error;
    }

    res.status(201).json({
      message: 'Service created successfully',
      service: {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        currency: data.currency,
        location: data.location,
        image: data.image,
        isActive: data.is_active,
        createdAt: data.created_at
      }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    
    // Clean up the uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error creating service',
      error: error.message 
    });
  }
});

// Update a service
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price, currency, location, isActive } = req.body;
    
    // Check if service exists and belongs to the user
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (fetchError || !existingService) {
      return res.status(404).json({ message: 'Service not found or you do not have permission to update it' });
    }
    
    // Prepare update data
    const updateData = {
      title: title || existingService.title,
      description: description || existingService.description,
      category: category || existingService.category,
      price: price || existingService.price,
      currency: currency || existingService.currency,
      location: location || existingService.location,
      is_active: isActive !== undefined ? isActive : existingService.is_active,
      updated_at: new Date().toISOString()
    };
    
    // Process uploaded image if present
    if (req.file) {
      const relativePath = '/uploads/service-images/' + path.basename(req.file.path);
      updateData.image = `${req.protocol}://${req.get('host')}${relativePath}`;
      console.log('Service image updated:', updateData.image);
      
      // Delete old image if it exists
      if (existingService.image && existingService.image.includes('/uploads/service-images/')) {
        try {
          const oldImagePath = path.join(
            __dirname, 
            '../public', 
            existingService.image.split('/uploads')[1]
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Old service image deleted:', oldImagePath);
          }
        } catch (error) {
          console.warn('Error deleting old service image:', error);
        }
      }
    }
    
    // Update the service
    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      // Clean up the uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw error;
    }
    
    res.json({
      message: 'Service updated successfully',
      service: {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        currency: data.currency,
        location: data.location,
        image: data.image,
        isActive: data.is_active,
        updatedAt: data.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating service:', error);
    
    // Clean up the uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error updating service',
      error: error.message 
    });
  }
});

// Delete a service
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if service exists and belongs to the user
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (fetchError || !existingService) {
      return res.status(404).json({ message: 'Service not found or you do not have permission to delete it' });
    }
    
    // Delete the service
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Delete the service image if it exists
    if (existingService.image && existingService.image.includes('/uploads/service-images/')) {
      try {
        const imagePath = path.join(
          __dirname, 
          '../public', 
          existingService.image.split('/uploads')[1]
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Service image deleted:', imagePath);
        }
      } catch (error) {
        console.warn('Error deleting service image:', error);
      }
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ 
      message: 'Error deleting service',
      error: error.message 
    });
  }
});

module.exports = router 