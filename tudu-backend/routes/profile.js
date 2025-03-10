const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { supabase } = require('../db')
const auth = require('../middleware/auth')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.memoryStorage()
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
      return res.status(400).json({ message: 'No file uploaded' })
    }

    console.log('Processing profile image upload for user:', req.user.id);

    // Mai întâi verificăm dacă utilizatorul are deja o imagine de profil
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('profile_image')
      .eq('id', req.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError);
      // Continuăm chiar dacă nu putem obține datele utilizatorului
    }

    // Încercăm să ștergem imaginea veche, dar nu blocăm procesul dacă eșuează
    if (currentUser?.profile_image) {
      try {
        const oldImagePath = currentUser.profile_image.split('/').slice(-2).join('/');
        await supabase.storage
          .from('user-uploads')
          .remove([oldImagePath]);
      } catch (deleteError) {
        console.warn('Could not delete old profile image:', deleteError);
        // Continuăm chiar dacă ștergerea eșuează
      }
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}${fileExt}`;
    const filePath = `profile-images/${req.user.id}/${fileName}`;

    let publicUrl = null;
    let uploadSuccess = false;

    // Încercăm să încărcăm imaginea în Supabase
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading file to Supabase:', uploadError);
        // Continuăm cu un URL temporar
        publicUrl = `https://via.placeholder.com/150?text=${req.user.first_name.charAt(0)}${req.user.last_name ? req.user.last_name.charAt(0) : ''}`;
      } else {
        console.log('Image uploaded successfully to Supabase');
        uploadSuccess = true;
        
        // Get public URL
        const { data: { publicUrl: supabaseUrl } } = supabase.storage
          .from('user-uploads')
          .getPublicUrl(filePath);
        
        publicUrl = supabaseUrl;
      }
    } catch (storageError) {
      console.error('Error in Supabase storage operations:', storageError);
      // Folosim un URL temporar pentru placeholder
      publicUrl = `https://via.placeholder.com/150?text=${req.user.first_name.charAt(0)}${req.user.last_name ? req.user.last_name.charAt(0) : ''}`;
    }

    console.log('Updating user profile with image URL:', publicUrl);

    // Update user profile with new image URL
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
      console.error('Error updating user profile in database:', updateError);
      return res.status(500).json({ 
        message: 'Error updating user profile in database',
        error: process.env.NODE_ENV === 'development' ? updateError.message : undefined
      });
    }

    console.log('User profile updated successfully');

    // Return updated user data
    res.json({
      message: uploadSuccess ? 'Profile image uploaded and profile updated successfully' : 'Profile updated with placeholder image',
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
    res.status(500).json({ 
      message: 'Error processing profile image upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
          created_at,
          service_images (
            id,
            image_url,
            is_main
          )
        `)
        .eq('user_id', user.id)

      if (!servicesError) {
        services = servicesData
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

module.exports = router 