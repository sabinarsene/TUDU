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
    const uploadDir = path.join(__dirname, '../public/uploads/requests')
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
    cb(null, 'request-' + uniqueSuffix + ext)
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

// Get all requests with user information
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        r.id, 
        r.title, 
        r.description, 
        r.category, 
        r.budget, 
        r.currency, 
        r.location, 
        r.deadline,
        r.status,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.profile_image,
        u.rating as user_rating,
        u.review_count as user_review_count,
        (SELECT json_agg(
          json_build_object(
            'id', ri.id,
            'image_url', ri.image_url
          )
        ) FROM request_images ri WHERE ri.request_id = r.id) as images
      FROM 
        requests r
      JOIN 
        users u ON r.user_id = u.id
      ORDER BY 
        r.created_at DESC`
    )
    
    // Format the response to include user information
    const formattedRequests = result.rows.map(request => {
      // Calculate time difference for "posted at" display
      const postedAt = getTimeAgo(request.created_at);
      
      // Format deadline for display
      const deadline = formatDeadline(request.deadline);
      
      // Construiește URL-ul complet pentru imaginea de profil
      const profileImageUrl = request.profile_image 
        ? `/uploads/profile/${request.profile_image}` 
        : null;
      
      return {
        id: request.id,
        title: request.title,
        description: request.description,
        category: request.category,
        budget: request.budget,
        currency: request.currency,
        location: request.location,
        deadline: deadline,
        status: request.status,
        created_at: request.created_at,
        updated_at: request.updated_at,
        postedAt: postedAt,
        images: request.images || [],
        user: {
          id: request.user_id,
          name: `${request.first_name} ${request.last_name.charAt(0)}.`,
          image: profileImageUrl,
          rating: request.user_rating,
          reviewCount: request.user_review_count
        }
      };
    });
    
    res.json(formattedRequests)
  } catch (error) {
    console.error('Error fetching requests:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get request by ID with user information and images
router.get('/:id', async (req, res) => {
  try {
    // Get request with user information
    const requestResult = await db.query(
      `SELECT 
        r.id, 
        r.title, 
        r.description, 
        r.category, 
        r.budget, 
        r.currency, 
        r.location, 
        r.deadline,
        r.status,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.profile_image,
        u.rating as user_rating,
        u.review_count as user_review_count,
        u.bio as user_bio
      FROM 
        requests r
      JOIN 
        users u ON r.user_id = u.id
      WHERE 
        r.id = $1`,
      [req.params.id]
    )
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' })
    }

    // Get request images
    const imagesResult = await db.query(
      'SELECT id, image_url FROM request_images WHERE request_id = $1',
      [req.params.id]
    )

    // Format the response
    const request = requestResult.rows[0]
    
    // Construiește URL-ul complet pentru imaginea de profil
    const profileImageUrl = request.profile_image 
      ? `/uploads/profile/${request.profile_image}` 
      : null;
      
    // Formatează imaginile cererii
    const formattedImages = imagesResult.rows.map(img => ({
      id: img.id,
      image_url: img.image_url
    }));
    
    const formattedRequest = {
      id: request.id,
      title: request.title,
      description: request.description,
      category: request.category,
      budget: request.budget,
      currency: request.currency,
      location: request.location,
      deadline: formatDeadline(request.deadline),
      status: request.status,
      created_at: request.created_at,
      updated_at: request.updated_at,
      postedAt: getTimeAgo(request.created_at),
      user: {
        id: request.user_id,
        name: `${request.first_name} ${request.last_name}`,
        image: profileImageUrl,
        rating: request.user_rating,
        reviewCount: request.user_review_count,
        bio: request.user_bio
      },
      images: formattedImages
    }

    res.json(formattedRequest)
  } catch (error) {
    console.error('Error fetching request:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Helper function to convert deadline text to timestamp
function convertDeadlineToTimestamp(deadlineText) {
  console.log('Converting deadline text:', deadlineText);
  const now = new Date();
  
  // Normalize the text by trimming and removing any extra spaces
  const normalizedText = deadlineText.trim().replace(/\s+/g, ' ');
  console.log('Normalized deadline text:', normalizedText);
  
  switch (normalizedText) {
    case 'Urgent (24h)':
      const urgentDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      console.log('Urgent deadline:', urgentDate);
      return urgentDate;
    case 'În 2-3 zile':
      const threeDaysDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      console.log('3 days deadline:', threeDaysDate);
      return threeDaysDate;
    case 'Această săptămână':
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      console.log('End of week deadline:', endOfWeek);
      return endOfWeek;
    case 'Săptămâna viitoare':
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      console.log('Next week deadline:', nextWeek);
      return nextWeek;
    case 'În 2 săptămâni':
      const twoWeeks = new Date(now);
      twoWeeks.setDate(now.getDate() + 14);
      console.log('Two weeks deadline:', twoWeeks);
      return twoWeeks;
    case 'În această lună':
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      console.log('End of month deadline:', endOfMonth);
      return endOfMonth;
    case 'Flexibil':
      console.log('Flexible deadline - returning null');
      return null;
    default:
      console.error('Invalid deadline text:', normalizedText);
      // În loc să returnăm null, să încercăm să parsăm textul ca dată
      try {
        const parsedDate = new Date(normalizedText);
        if (!isNaN(parsedDate.getTime())) {
          console.log('Successfully parsed date:', parsedDate);
          return parsedDate;
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
      return null;
  }
}

// Create new request with image upload
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    // Debugging - afișăm datele primite
    console.log('Request body received:', req.body);
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('User ID:', req.user.id);
    
    // Verificăm dacă avem toate câmpurile necesare
    const {
      title,
      description,
      category,
      budget,
      currency,
      location,
      deadline
    } = req.body;
    
    // Verificăm dacă câmpurile obligatorii există și nu sunt goale
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!category || category.trim() === '') {
      return res.status(400).json({ message: 'Category is required' });
    }
    
    if (!description || description.trim() === '') {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    if (!location || location.trim() === '') {
      return res.status(400).json({ message: 'Location is required' });
    }
    
    // Folosim tranzacții pentru a asigura consistența datelor
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Pregătim datele pentru inserare
      const cleanTitle = title.trim();
      const cleanDescription = description.trim();
      const cleanCategory = category.trim();
      const cleanLocation = location.trim();
      const cleanBudget = budget ? budget.trim() : null;
      const cleanCurrency = currency ? currency.trim() : 'RON';
      const deadlineDate = deadline ? convertDeadlineToTimestamp(deadline.trim()) : null;
      
      console.log('Cleaned data:', {
        title: cleanTitle,
        description: cleanDescription,
        category: cleanCategory,
        location: cleanLocation,
        budget: cleanBudget,
        currency: cleanCurrency,
        deadline: deadlineDate
      });
      
      // Insert request
      const requestResult = await client.query(
        `INSERT INTO requests 
         (user_id, title, description, category, budget, currency, location, deadline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [req.user.id, cleanTitle, cleanDescription, cleanCategory, cleanBudget, cleanCurrency, cleanLocation, deadlineDate]
      );

      console.log('Request inserted successfully:', requestResult.rows[0]);
      const requestId = requestResult.rows[0].id;

      // Process uploaded images
      if (req.files && req.files.length > 0) {
        console.log('Processing images:', req.files.length);
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const imageUrl = `/uploads/requests/${file.filename}`;
          
          console.log('Inserting image:', imageUrl);
          await client.query(
            `INSERT INTO request_images (request_id, image_url)
             VALUES ($1, $2)`,
            [requestId, imageUrl]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Return success response with complete request data
      const completeRequest = await db.query(
        `SELECT 
          r.*,
          u.first_name,
          u.last_name,
          u.profile_image,
          u.rating as user_rating,
          u.review_count as user_review_count,
          (SELECT json_agg(
            json_build_object(
              'id', ri.id,
              'image_url', ri.image_url
            )
          ) FROM request_images ri WHERE ri.request_id = r.id) as images
        FROM 
          requests r
        JOIN
          users u ON r.user_id = u.id
        WHERE 
          r.id = $1`,
        [requestId]
      );

      console.log('Complete request data:', completeRequest.rows[0]);

      // Format response
      const request = completeRequest.rows[0];
      const formattedRequest = {
        id: request.id,
        title: request.title,
        description: request.description,
        category: request.category,
        budget: request.budget,
        currency: request.currency,
        location: request.location,
        deadline: formatDeadline(request.deadline),
        status: request.status,
        created_at: request.created_at,
        updated_at: request.updated_at,
        postedAt: getTimeAgo(request.created_at),
        user: {
          id: request.user_id,
          name: `${request.first_name} ${request.last_name.charAt(0)}.`,
          image: request.profile_image ? `/uploads/profile/${request.profile_image}` : null,
          rating: request.user_rating,
          reviewCount: request.user_review_count
        },
        images: request.images || []
      };
      
      res.status(201).json(formattedRequest);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Update request
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      budget,
      currency,
      location,
      deadline,
      status
    } = req.body

    const result = await db.query(
      `UPDATE requests 
       SET title = $1, 
           description = $2, 
           category = $3, 
           budget = $4, 
           currency = $5, 
           location = $6,
           deadline = $7,
           status = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [title, description, category, budget, currency, location, deadline, status, req.params.id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found or unauthorized' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating request:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete request
router.delete('/:id', auth, async (req, res) => {
  try {
    // Folosim tranzacții pentru a asigura consistența datelor
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get request images to delete files
      const imagesResult = await client.query(
        'SELECT image_url FROM request_images WHERE request_id = $1',
        [req.params.id]
      );
      
      // Delete request (will cascade delete images from database)
      const result = await client.query(
        'DELETE FROM requests WHERE id = $1 AND user_id = $2 RETURNING *',
        [req.params.id, req.user.id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Request not found or unauthorized' });
      }
      
      // Delete image files from disk
      imagesResult.rows.forEach(image => {
        const imagePath = path.join(__dirname, '../public', image.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
      
      await client.query('COMMIT');
      res.json({ message: 'Request deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to format time ago
function getTimeAgo(timestamp) {
  const now = new Date();
  const postedDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - postedDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Acum câteva secunde';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Acum ${minutes} ${minutes === 1 ? 'minut' : 'minute'}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Acum ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Acum ${days} ${days === 1 ? 'zi' : 'zile'}`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `Acum ${months} ${months === 1 ? 'lună' : 'luni'}`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `Acum ${years} ${years === 1 ? 'an' : 'ani'}`;
  }
}

// Helper function to format deadline
function formatDeadline(deadline) {
  if (!deadline) return 'Fără termen limită';
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffInDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) {
    return 'Expirat';
  } else if (diffInDays === 0) {
    return 'Astăzi';
  } else if (diffInDays === 1) {
    return 'Mâine';
  } else if (diffInDays < 7) {
    return `În ${diffInDays} zile`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `În ${weeks} ${weeks === 1 ? 'săptămână' : 'săptămâni'}`;
  } else {
    return deadlineDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

module.exports = router 