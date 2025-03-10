const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/services')
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'service-' + uniqueSuffix + ext)
  }
})

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Get all services with provider information
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.category, 
        s.price, 
        s.currency, 
        s.location, 
        s.rating, 
        s.review_count,
        s.created_at,
        s.updated_at,
        u.id as provider_id,
        u.first_name,
        u.last_name,
        u.profile_image,
        (SELECT si.image_url FROM service_images si WHERE si.service_id = s.id AND si.is_main = true LIMIT 1) as image_url
      FROM 
        services s
      JOIN 
        users u ON s.user_id = u.id
      ORDER BY 
        s.created_at DESC`
    )
    
    // Format the response to include provider name and image
    const formattedServices = result.rows.map(service => {
      // Construiește URL-ul complet pentru imaginea de profil
      const profileImageUrl = service.profile_image 
        ? `/uploads/profile/${service.profile_image}` 
        : null;
        
      // Construiește URL-ul complet pentru imaginea serviciului
      const serviceImageUrl = service.image_url || null;
      
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        currency: service.currency,
        location: service.location,
        rating: service.rating,
        review_count: service.review_count,
        created_at: service.created_at,
        updated_at: service.updated_at,
        provider_id: service.provider_id,
        provider_name: `${service.first_name} ${service.last_name.charAt(0)}.`,
        provider_image: profileImageUrl,
        image_url: serviceImageUrl
      };
    });
    
    res.json(formattedServices)
  } catch (error) {
    console.error('Error fetching services:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get service by ID with provider information and images
router.get('/:id', async (req, res) => {
  try {
    // Get service with provider information
    const serviceResult = await db.query(
      `SELECT 
        s.id, 
        s.title, 
        s.description, 
        s.category, 
        s.price, 
        s.currency, 
        s.location, 
        s.rating, 
        s.review_count,
        s.created_at,
        s.updated_at,
        u.id as provider_id,
        u.first_name,
        u.last_name,
        u.profile_image,
        u.rating as provider_rating,
        u.review_count as provider_review_count,
        u.bio as provider_bio
      FROM 
        services s
      JOIN 
        users u ON s.user_id = u.id
      WHERE 
        s.id = $1`,
      [req.params.id]
    )
    
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' })
    }

    // Get service images
    const imagesResult = await db.query(
      'SELECT id, image_url, is_main FROM service_images WHERE service_id = $1 ORDER BY is_main DESC',
      [req.params.id]
    )

    // Format the response
    const service = serviceResult.rows[0]
    
    // Construiește URL-ul complet pentru imaginea de profil
    const profileImageUrl = service.profile_image 
      ? `/uploads/profile/${service.profile_image}` 
      : null;
      
    // Formatează imaginile serviciului
    const formattedImages = imagesResult.rows.map(img => ({
      id: img.id,
      image_url: img.image_url,
      is_main: img.is_main
    }));
    
    const formattedService = {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      currency: service.currency,
      location: service.location,
      rating: service.rating,
      review_count: service.review_count,
      created_at: service.created_at,
      updated_at: service.updated_at,
      provider: {
        id: service.provider_id,
        name: `${service.first_name} ${service.last_name}`,
        image: profileImageUrl,
        rating: service.provider_rating,
        review_count: service.provider_review_count,
        bio: service.provider_bio
      },
      images: formattedImages
    }

    res.json(formattedService)
  } catch (error) {
    console.error('Error fetching service:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new service with image upload
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    // Folosim tranzacții pentru a asigura consistența datelor
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const {
        title,
        description,
        category,
        price,
        currency,
        location
      } = req.body;

      // Insert service
      const serviceResult = await client.query(
        `INSERT INTO services 
         (user_id, title, description, category, price, currency, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [req.user.id, title, description, category, price, currency || 'RON', location]
      );

      const serviceId = serviceResult.rows[0].id;

      // Process uploaded images
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const imageUrl = `/uploads/services/${file.filename}`;
          
          // First image is the main image
          const isMain = i === 0;
          
          await client.query(
            `INSERT INTO service_images (service_id, image_url, is_main)
             VALUES ($1, $2, $3)`,
            [serviceId, imageUrl, isMain]
          );
        }
      }

      await client.query('COMMIT');

      // Get the complete service with images and provider info
      const completeServiceResult = await db.query(
        `SELECT 
          s.*,
          u.first_name,
          u.last_name,
          u.profile_image,
          (SELECT json_agg(
            json_build_object(
              'id', si.id,
              'image_url', si.image_url,
              'is_main', si.is_main
            )
          ) FROM service_images si WHERE si.service_id = s.id) as images
        FROM 
          services s
        JOIN
          users u ON s.user_id = u.id
        WHERE 
          s.id = $1`,
        [serviceId]
      );

      // Format response
      const service = completeServiceResult.rows[0];
      const formattedService = {
        ...service,
        provider_name: `${service.first_name} ${service.last_name.charAt(0)}.`,
        provider_image: service.profile_image ? `/uploads/profile/${service.profile_image}` : null
      };
      
      // Remove unnecessary fields
      delete formattedService.first_name;
      delete formattedService.last_name;
      delete formattedService.profile_image;

      res.status(201).json(formattedService);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      currency,
      location
    } = req.body

    const result = await db.query(
      `UPDATE services 
       SET title = $1, 
           description = $2, 
           category = $3, 
           price = $4, 
           currency = $5, 
           location = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, description, category, price, currency, location, req.params.id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found or unauthorized' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating service:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete service
router.delete('/:id', auth, async (req, res) => {
  try {
    // Folosim tranzacții pentru a asigura consistența datelor
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get service images to delete files
      const imagesResult = await client.query(
        'SELECT image_url FROM service_images WHERE service_id = $1',
        [req.params.id]
      );
      
      // Delete service (will cascade delete images from database)
      const result = await client.query(
        'DELETE FROM services WHERE id = $1 AND user_id = $2 RETURNING *',
        [req.params.id, req.user.id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Service not found or unauthorized' });
      }
      
      // Delete image files from disk
      imagesResult.rows.forEach(image => {
        const imagePath = path.join(__dirname, '../public', image.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
      
      await client.query('COMMIT');
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router 