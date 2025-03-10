const express = require('express')
const router = express.Router()
const { supabase } = require('../db')
const auth = require('../middleware/auth')

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

// Get all requests with user information
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching requests:', error)
      return res.status(500).json({ 
        message: 'Error fetching requests from database',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }

    // Verificăm dacă avem date valide
    if (!requests || !Array.isArray(requests)) {
      console.error('Invalid requests data:', requests)
      return res.status(500).json({ message: 'Invalid data format received from database' })
    }

    // Format the response
    try {
      const formattedRequests = requests.map(request => {
        // Verificăm dacă request.user există
        if (!request.user) {
          return {
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
              name: 'Utilizator necunoscut',
              image: null,
              rating: 0,
              reviewCount: 0
            }
          }
        }

        return {
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
            name: `${request.user.first_name} ${request.user.last_name ? request.user.last_name.charAt(0) + '.' : ''}`,
            image: request.user.profile_image,
            rating: request.user.rating,
            reviewCount: request.user.review_count
          }
        }
      })

      res.json(formattedRequests)
    } catch (formatError) {
      console.error('Error formatting requests:', formatError)
      res.status(500).json({ 
        message: 'Error formatting request data',
        error: process.env.NODE_ENV === 'development' ? formatError.message : undefined
      })
    }
  } catch (error) {
    console.error('Error fetching requests:', error)
    res.status(500).json({ 
      message: 'Server error processing requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

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
})

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
})

// Create new request
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new request with data:', req.body);
    
    const {
      title,
      description,
      category,
      budget,
      currency,
      location,
      deadline
    } = req.body

    // Validăm datele primite
    if (!title) {
      return res.status(400).json({ 
        message: 'Title is required',
        field: 'title'
      });
    }
    
    if (!description) {
      return res.status(400).json({ 
        message: 'Description is required',
        field: 'description'
      });
    }
    
    if (!category) {
      return res.status(400).json({ 
        message: 'Category is required',
        field: 'category'
      });
    }

    // Convert deadline text to timestamp if provided
    const deadlineTimestamp = deadline ? convertDeadlineToTimestamp(deadline) : null

    // Verificăm dacă utilizatorul există
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', req.user.id)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      return res.status(400).json({ 
        message: 'Invalid user ID or user not found',
        error: process.env.NODE_ENV === 'development' ? userError.message : undefined
      });
    }
    
    if (!userData) {
      return res.status(400).json({ 
        message: 'User not found',
        error: 'The user associated with this request does not exist'
      });
    }

    // Pregătim datele pentru inserare
    const requestData = {
      user_id: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      budget: budget ? parseFloat(budget) : null,
      currency: currency || 'RON',
      location: location ? location.trim() : null,
      deadline: deadlineTimestamp,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Inserting request with data:', requestData);

    // Insert request
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert([requestData])
      .select()
      .single();

    if (requestError) {
      console.error('Error creating request:', requestError);
      return res.status(500).json({ 
        message: 'Error creating request',
        error: process.env.NODE_ENV === 'development' ? requestError.message : undefined,
        details: requestError
      });
    }

    console.log('Request created successfully:', request);

    // Obținem datele utilizatorului pentru a le include în răspuns
    const { data: userDetails, error: userDetailsError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        profile_image,
        rating,
        review_count
      `)
      .eq('id', req.user.id)
      .single();

    if (userDetailsError) {
      console.warn('Could not fetch user details for response:', userDetailsError);
      // Continuăm chiar dacă nu putem obține detaliile utilizatorului
    }

    // Format response
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
      user: userDetails ? {
        id: userDetails.id,
        name: `${userDetails.first_name} ${userDetails.last_name ? userDetails.last_name.charAt(0) + '.' : ''}`,
        image: userDetails.profile_image,
        rating: userDetails.rating,
        reviewCount: userDetails.review_count
      } : {
        id: req.user.id,
        name: 'User',
        image: null,
        rating: 0,
        reviewCount: 0
      }
    };

    res.status(201).json(formattedRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ 
      message: 'Server error creating request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

    // Verify ownership
    const { data: existingRequest, error: checkError } = await supabase
      .from('requests')
      .select('user_id')
      .eq('id', req.params.id)
      .single()

    if (checkError || !existingRequest) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (existingRequest.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this request' })
    }

    // Update request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('requests')
      .update({
        title,
        description,
        category,
        budget,
        currency,
        location,
        deadline: deadline ? convertDeadlineToTimestamp(deadline) : null,
        status: status || 'open',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
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
      .single()

    if (updateError) throw updateError

    // Format response
    const formattedRequest = {
      id: updatedRequest.id,
      title: updatedRequest.title,
      description: updatedRequest.description,
      category: updatedRequest.category,
      budget: updatedRequest.budget,
      currency: updatedRequest.currency,
      location: updatedRequest.location,
      deadline: formatDeadline(updatedRequest.deadline),
      status: updatedRequest.status,
      created_at: updatedRequest.created_at,
      updated_at: updatedRequest.updated_at,
      postedAt: getTimeAgo(updatedRequest.created_at),
      user: {
        id: updatedRequest.user.id,
        name: `${updatedRequest.user.first_name} ${updatedRequest.user.last_name}`,
        image: updatedRequest.user.profile_image,
        rating: updatedRequest.user.rating,
        reviewCount: updatedRequest.user.review_count
      }
    }

    res.json(formattedRequest)
  } catch (error) {
    console.error('Error updating request:', error)
    res.status(500).json({ 
      message: 'Error updating request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Delete request
router.delete('/:id', auth, async (req, res) => {
  try {
    // Verify ownership
    const { data: request, error: checkError } = await supabase
      .from('requests')
      .select('user_id')
      .eq('id', req.params.id)
      .single()

    if (checkError || !request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (request.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this request' })
    }

    // Delete request
    const { error: deleteError } = await supabase
      .from('requests')
      .delete()
      .eq('id', req.params.id)

    if (deleteError) throw deleteError

    res.json({ message: 'Request deleted successfully' })
  } catch (error) {
    console.error('Error deleting request:', error)
    res.status(500).json({ 
      message: 'Error deleting request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router 