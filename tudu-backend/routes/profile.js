const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { supabase, supabaseAdmin } = require('../db')
const auth = require('../middleware/auth')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

// Configure multer for file uploads with disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../public/uploads/profile-images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.user.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `user-${userId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and WebP are allowed.'))
    }
  }
})

// Endpoint pentru încărcarea imaginii de profil
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Processing profile image upload for user:', req.user.id);
    console.log('File uploaded:', req.file);
    
    // Verificăm dacă utilizatorul există în baza de date
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, profile_image')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return res.status(404).json({ 
        message: 'User not found',
        error: userError.message 
      });
    }

    // Delete old image file if it exists
    if (currentUser?.profile_image) {
      try {
        const oldImagePath = currentUser.profile_image;
        if (oldImagePath.includes('/uploads/profile-images/')) {
          const localPath = path.join(__dirname, '../public', oldImagePath.split('/uploads')[1]);
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
            console.log('Old profile image deleted:', localPath);
          }
        }
      } catch (error) {
        console.warn('Error deleting old profile image:', error);
      }
    }

    // Generate public URL for the uploaded file
    const relativePath = '/uploads/profile-images/' + path.basename(req.file.path);
    const publicUrl = `${req.protocol}://${req.get('host')}${relativePath}`;
    
    console.log('Generated public URL:', publicUrl);

    // Actualizăm profilul utilizatorului cu noul URL
    console.log('Updating user profile with new image URL...');
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({ 
        profile_image: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select(`
        id, 
        first_name, 
        last_name, 
        email, 
        profile_image,
        is_provider,
        rating,
        review_count
      `)
      .single();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      // Delete the uploaded file if profile update fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({ 
        message: 'Error updating user profile',
        error: updateError.message 
      });
    }

    console.log('User profile updated successfully:', userData);

    res.json({
      message: 'Profile image uploaded successfully',
      user: {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        profileImage: userData.profile_image,
        isProvider: userData.is_provider,
        rating: userData.rating,
        reviewCount: userData.review_count
      }
    });
  } catch (error) {
    console.error('Error in profile image upload process:', error);
    
    // Clean up the uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error processing profile image upload',
      error: error.message || 'Unknown error occurred'
    });
  }
})

// Endpoint pentru vizualizarea profilului unui utilizator
router.get('/:userId', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        profile_image,
        location,
        member_since,
        rating,
        review_count,
        occupation,
        education,
        age,
        bio,
        specialization,
        experience,
        languages,
        availability,
        is_provider
      `)
      .eq('id', req.params.userId)
      .single()

    if (error) {
      throw error
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get user's services if they are a provider
    let services = []
    if (user.is_provider) {
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          price,
          currency,
          category,
          location,
          image,
          created_at,
          rating,
          review_count
        `)
        .eq('user_id', user.id)

      if (!servicesError) {
        services = servicesData.map(service => {
          // Ensure image URL is properly formatted
          let imageUrl = service.image;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
          }

          return {
            id: service.id,
            title: service.title,
            description: service.description,
            price: service.price,
            currency: service.currency,
            category: service.category,
            location: service.location,
            image: imageUrl,
            rating: service.rating,
            review_count: service.review_count,
            created_at: service.created_at,
            provider: {
              id: user.id,
              name: `${user.first_name} ${user.last_name}`,
              image: user.profile_image,
              rating: user.rating,
              reviewCount: user.review_count
            }
          }
        })
      }
    }

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      profileImage: user.profile_image,
      location: user.location,
      memberSince: user.member_since,
      rating: user.rating,
      reviewCount: user.review_count,
      occupation: user.occupation,
      education: user.education,
      age: user.age,
      bio: user.bio,
      specialization: user.specialization,
      experience: user.experience,
      languages: user.languages,
      availability: user.availability,
      isProvider: user.is_provider,
      services: services
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Server error: ' + error.message })
  }
})

// Endpoint pentru configurarea profilului (modificat din /setup în /)
router.post('/', auth, async (req, res) => {
  try {
    const {
      occupation,
      education,
      age,
      location,
      bio,
      specialization,
      experience,
      languages,
      availability
    } = req.body

    // Actualizează profilul utilizatorului
    const result = await supabase
      .from('users')
      .update({
        occupation: occupation,
        education: education,
        age: age,
        location: location,
        bio: bio,
        specialization: specialization,
        experience: experience,
        languages: languages,
        availability: availability,
        updated_at: new Date()
      })
      .eq('id', req.user.id)
      .select('id, first_name, last_name, email, profile_image, location, member_since, rating, review_count, occupation, education, age, bio, specialization, experience, languages, availability')

    if (result.data.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const updatedUser = {
      ...result.data[0],
      profileImage: result.data[0].profile_image,
      firstName: result.data[0].first_name,
      lastName: result.data[0].last_name,
      memberSince: result.data[0].member_since,
      reviewCount: result.data[0].review_count
    }

    console.log('Profile updated:', updatedUser)
    res.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ message: 'Server error: ' + error.message })
  }
})

// Endpoint pentru a obține data de membru
router.get('/member-since', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('member_since')
      .eq('id', req.user.id)
      .single()

    if (error) {
      throw error
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ memberSince: user.member_since })
  } catch (error) {
    console.error('Error fetching member since date:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's favorite services
router.get('/services/favorites', auth, async (req, res) => {
  try {
    console.log('Fetching favorite services for user:', req.user.id);
    
    // Get favorite service IDs
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorite_services')
      .select('service_id')
      .eq('user_id', req.user.id);
    
    if (favoritesError) {
      console.error('Error fetching favorite services:', favoritesError);
      return res.status(500).json({ 
        message: 'Error fetching favorite services',
        error: favoritesError.message 
      });
    }
    
    if (!favorites || favorites.length === 0) {
      return res.json({ services: [] });
    }
    
    // Get service details
    const serviceIds = favorites.map(fav => fav.service_id);
    const { data: services, error: servicesError } = await supabase
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
      .in('id', serviceIds);
    
    if (servicesError) {
      console.error('Error fetching service details:', servicesError);
      return res.status(500).json({ 
        message: 'Error fetching service details',
        error: servicesError.message 
      });
    }
    
    // Format services
    const formattedServices = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      currency: service.currency,
      location: service.location,
      category: service.category,
      image: service.image,
      provider: service.provider ? {
        id: service.provider.id,
        name: `${service.provider.first_name} ${service.provider.last_name}`,
        profileImage: service.provider.profile_image,
        rating: service.provider.rating,
        reviewCount: service.provider.review_count
      } : null
    }));
    
    res.json({ services: formattedServices });
  } catch (error) {
    console.error('Error fetching favorite services:', error);
    res.status(500).json({ 
      message: 'Error fetching favorite services',
      error: error.message 
    });
  }
});

// Get user's favorite requests
router.get('/requests/favorites', auth, async (req, res) => {
  try {
    // Forward the request to the requests router
    const requestsRouter = require('./requests');
    // Pass the request to the requests router
    req.url = '/favorites';
    requestsRouter(req, res);
  } catch (error) {
    console.error('Error forwarding to favorite requests:', error);
    res.status(500).json({ 
      message: 'Error fetching favorite requests',
      error: error.message
    });
  }
});

// Add service to favorites
router.post('/services/:serviceId/favorite', auth, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user.id;

    // Check if service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if already favorited
    const { data: existingFavorite, error: favoriteError } = await supabase
      .from('favorite_services')
      .select('id')
      .eq('user_id', userId)
      .eq('service_id', serviceId)
      .single();

    if (existingFavorite) {
      return res.status(400).json({ error: 'Service already in favorites' });
    }

    // Add to favorites
    const { error: insertError } = await supabase
      .from('favorite_services')
      .insert([{ user_id: userId, service_id: serviceId }]);

    if (insertError) {
      throw insertError;
    }

    res.json({ message: 'Service added to favorites' });
  } catch (error) {
    console.error('Error adding service to favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove service from favorites
router.delete('/services/:serviceId/favorite', auth, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('favorite_services')
      .delete()
      .eq('user_id', userId)
      .eq('service_id', serviceId);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Service not found in favorites' });
    }

    res.json({ message: 'Service removed from favorites' });
  } catch (error) {
    console.error('Error removing service from favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if service is favorited
router.get('/services/:serviceId/favorite', auth, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user.id;

    const { data: favorite, error } = await supabase
      .from('favorite_services')
      .select('id')
      .eq('user_id', userId)
      .eq('service_id', serviceId)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
      throw error;
    }

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Error checking service favorite status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router 