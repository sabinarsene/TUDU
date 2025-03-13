const express = require('express')
const router = express.Router()
const { supabase } = require('../db')
const authenticateToken = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads with disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../public/uploads/request-images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `request-${uniqueSuffix}${ext}`);
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

// Helper function to format time ago
function getTimeAgo(timestamp) {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInSeconds = Math.floor((now - past) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`
}

// Helper function to format deadline
function formatDeadline(deadline) {
  if (!deadline) return null
  const date = new Date(deadline)
  return date.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Helper function to convert deadline text to timestamp
function convertDeadlineToTimestamp(deadlineText) {
  if (!deadlineText) return null
  return new Date(deadlineText).toISOString()
}

// Get all requests
router.get('/', async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('requests')
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_image,
          rating,
          review_count
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedRequests = requests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      category: request.category,
      budget: request.budget,
      currency: request.currency,
      location: request.location,
      deadline: request.deadline,
      deadlineFormatted: formatDeadline(request.deadline),
      image: request.image,
      status: request.status,
      createdAt: request.created_at,
      timeAgo: getTimeAgo(request.created_at),
      user: {
        id: request.user.id,
        name: `${request.user.first_name} ${request.user.last_name}`,
        profileImage: request.user.profile_image,
        rating: request.user.rating,
        reviewCount: request.user.review_count
      }
    }));

    res.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ 
      message: 'Error fetching requests',
      error: error.message 
    });
  }
});

// Get user's favorite requests (must be first)
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    // Get favorite request IDs
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorite_requests')
      .select('request_id')
      .eq('user_id', req.user.id);
    
    if (favoritesError) {
      console.error('Error fetching favorite requests:', favoritesError);
      throw favoritesError;
    }
    
    if (!favorites || favorites.length === 0) {
      return res.json({ requests: [] });
    }
    
    // Get request details
    const requestIds = favorites.map(fav => fav.request_id);
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_image,
          rating,
          review_count
        )
      `)
      .in('id', requestIds)
      .order('created_at', { ascending: false });
    
    if (requestsError) {
      console.error('Error fetching favorite request details:', requestsError);
      throw requestsError;
    }
    
    // Format the response
    const formattedRequests = requests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      category: request.category,
      budget: request.budget,
      currency: request.currency,
      location: request.location,
      deadline: request.deadline,
      deadlineFormatted: formatDeadline(request.deadline),
      image: request.image,
      status: request.status,
      createdAt: request.created_at,
      timeAgo: getTimeAgo(request.created_at),
      user: {
        id: request.user.id,
        name: `${request.user.first_name} ${request.user.last_name}`,
        profileImage: request.user.profile_image,
        rating: request.user.rating,
        reviewCount: request.user.review_count
      }
    }));
    
    res.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching favorite requests:', error);
    res.status(500).json({ 
      message: 'Error fetching favorite requests',
      error: error.message 
    });
  }
});

// Now the specific ID routes
router.get('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`Checking favorite status for request ${id} and user ${userId}`);
    
    const { data: favorite, error } = await supabase
      .from('favorite_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('request_id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('Error checking favorite status:', error);
      throw error;
    }
    
    console.log('Favorite status:', !!favorite);
    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Error checking request favorite status:', error);
    res.status(500).json({ 
      message: 'Error checking favorite status',
      error: error.message 
    });
  }
});

router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`Adding request ${id} to favorites for user ${userId}`);
    
    // Check if request exists
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('id')
      .eq('id', id)
      .single();
    
    if (requestError || !request) {
      console.error('Request not found:', requestError);
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if already favorited
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorite_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('request_id', id)
      .single();
    
    if (existingFavorite) {
      console.log('Request already in favorites');
      return res.status(400).json({ message: 'Request already in favorites' });
    }
    
    // Add to favorites
    const { data, error } = await supabase
      .from('favorite_requests')
      .insert({
        user_id: userId,
        request_id: parseInt(id)
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding request to favorites:', error);
      throw error;
    }
    
    console.log('Request added to favorites successfully');
    res.status(201).json({
      message: 'Request added to favorites',
      favorite: data
    });
  } catch (error) {
    console.error('Error in favorite request process:', error);
    res.status(500).json({ 
      message: 'Error adding request to favorites',
      error: error.message 
    });
  }
});

router.delete('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`Removing request ${id} from favorites for user ${userId}`);
    
    // Remove from favorites
    const { data, error } = await supabase
      .from('favorite_requests')
      .delete()
      .eq('user_id', userId)
      .eq('request_id', id)
      .select();
    
    if (error) {
      console.error('Error removing request from favorites:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Request not found in favorites' });
    }
    
    console.log('Request removed from favorites successfully');
    res.json({
      message: 'Request removed from favorites'
    });
  } catch (error) {
    console.error('Error in unfavorite request process:', error);
    res.status(500).json({ 
      message: 'Error removing request from favorites',
      error: error.message 
    });
  }
});

// Get request by ID with user information
router.get('/:id', async (req, res) => {
  try {
    const { data: request, error } = await supabase
      .from('requests')
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_image,
          rating,
          review_count,
          bio
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

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
        id: request.user.id,
        name: `${request.user.first_name} ${request.user.last_name}`,
        image: request.user.profile_image,
        rating: request.user.rating,
        reviewCount: request.user.review_count,
        bio: request.user.bio
      }
    }

    res.json(formattedRequest)
  } catch (error) {
    console.error('Error fetching request:', error)
    res.status(500).json({ message: 'Server error' })
  }
});

// Get requests by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('requests')
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_image
        )
      `)
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const formattedRequests = requests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      budget: request.budget,
      location: request.location,
      deadline: request.deadline,
      category: request.category,
      status: request.status,
      created_at: request.created_at,
      user: {
        id: request.user.id,
        name: `${request.user.first_name} ${request.user.last_name}`,
        image: request.user.profile_image
      }
    }))

    res.json(formattedRequests)
  } catch (error) {
    console.error('Error fetching requests by user ID:', error)
    res.status(500).json({ message: 'Server error' })
  }
});

// Create a new request
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, budget, currency, location, deadline } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let imageUrl = null;
    
    // Process uploaded image if present
    if (req.file) {
      const relativePath = '/uploads/request-images/' + path.basename(req.file.path);
      imageUrl = `${req.protocol}://${req.get('host')}${relativePath}`;
      console.log('Request image uploaded:', imageUrl);
    }

    // Convert deadline to timestamp if provided
    const deadlineTimestamp = convertDeadlineToTimestamp(deadline);

    // Insert the new request
    const { data, error } = await supabase
      .from('requests')
      .insert({
        user_id: req.user.id,
        title,
        description,
        category,
        budget: budget ? parseFloat(budget) : null,
        currency: currency || 'RON',
        location,
        deadline: deadlineTimestamp,
        image: imageUrl,
        status: 'open'
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
      message: 'Request created successfully',
      request: {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        budget: data.budget,
        currency: data.currency,
        location: data.location,
        deadline: data.deadline,
        deadlineFormatted: formatDeadline(data.deadline),
        image: data.image,
        status: data.status,
        createdAt: data.created_at,
        timeAgo: getTimeAgo(data.created_at)
      }
    });
  } catch (error) {
    console.error('Error creating request:', error);
    
    // Clean up the uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error creating request',
      error: error.message 
    });
  }
});

module.exports = router 