const express = require('express')
const router = express.Router()
const { supabase } = require('../db')
const auth = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
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
          profile_image
        )
      `)
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const formattedServices = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      location: service.location,
      category: service.category,
      created_at: service.created_at,
      provider_id: service.provider.id,
      provider_name: `${service.provider.first_name} ${service.provider.last_name}`,
      provider_image: service.provider.profile_image ? `/uploads/profile/${service.provider.profile_image}` : null
    }))

    res.json(formattedServices)
  } catch (error) {
    console.error('Error fetching services by user ID:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get service by ID
router.get('/:id', async (req, res) => {
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

    res.json(formattedService)
  } catch (error) {
    console.error('Error fetching service:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new service with image upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Creating new service with data:', {
      ...req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    })

    const {
      title,
      description,
      category,
      price,
      currency,
      location
    } = req.body

    // Validate required fields
    if (!title || !description || !category || !price || !location) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['title', 'description', 'category', 'price', 'location']
      })
    }

    let imageUrl = null;

    // Handle image upload if provided
    if (req.file) {
      try {
        const file = req.file
        const fileExt = path.extname(file.originalname).toLowerCase()
        const fileName = `${Date.now()}${fileExt}`
        const filePath = `service-images/${fileName}`

        console.log('Uploading image to Supabase storage:', {
          bucket: 'service-uploads',
          filePath,
          fileType: file.mimetype
        })

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('service-uploads')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          })

        if (uploadError) {
          console.error('Error uploading image to storage:', uploadError)
          console.log('Continuing service creation without image')
          // Nu salvăm local, continuăm fără imagine
        } else {
          console.log('Image uploaded successfully:', uploadData)

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('service-uploads')
            .getPublicUrl(filePath)

          imageUrl = publicUrl
          console.log('Generated public URL:', imageUrl)
        }
      } catch (uploadError) {
        console.error('Error in image upload process:', uploadError)
        console.log('Continuing service creation without image')
      }
    }

    console.log('Inserting service into database with data:', {
      user_id: req.user.id,
      title,
      description,
      category,
      price,
      currency: currency || 'RON',
      location,
      image: imageUrl
    })

    // Insert service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert([{
        user_id: req.user.id,
        title,
        description,
        category,
        price: parseFloat(price), // Ensure price is a number
        currency: currency || 'RON',
        location,
        image: imageUrl,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
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
      .single()

    if (serviceError) {
      console.error('Error inserting service into database:', serviceError)
      throw serviceError
    }

    console.log('Service created successfully:', service)

    // Format response
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
        reviewCount: service.provider.review_count
      }
    }

    res.status(201).json(formattedService)
  } catch (error) {
    console.error('Detailed error creating service:', {
      error: error.message,
      stack: error.stack,
      details: error.details || error
    })
    res.status(500).json({ 
      message: 'Error creating service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Update service
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      currency,
      location,
      is_active
    } = req.body

    // Verify ownership
    const { data: existingService, error: checkError } = await supabase
      .from('services')
      .select('user_id, image')
      .eq('id', req.params.id)
      .single()

    if (checkError || !existingService) {
      return res.status(404).json({ message: 'Service not found' })
    }

    if (existingService.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this service' })
    }

    let imageUrl = existingService.image

    // Handle new image upload if provided
    if (req.file) {
      // Delete old image if exists
      if (existingService.image) {
        const oldImagePath = existingService.image.split('/').slice(-2).join('/')
        try {
          await supabase.storage
            .from('service-uploads')
            .remove([oldImagePath])
        } catch (deleteError) {
          console.warn('Could not delete old service image:', deleteError)
        }
      }

      const file = req.file
      const fileExt = path.extname(file.originalname).toLowerCase()
      const fileName = `${Date.now()}${fileExt}`
      const filePath = `service-images/${fileName}`

      // Upload new image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('service-uploads')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('service-uploads')
        .getPublicUrl(filePath)

      imageUrl = publicUrl
    }

    // Update service
    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update({
        title,
        description,
        category,
        price,
        currency,
        location,
        image: imageUrl,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
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
      .single()

    if (updateError) throw updateError

    // Format response
    const formattedService = {
      id: updatedService.id,
      title: updatedService.title,
      description: updatedService.description,
      category: updatedService.category,
      price: updatedService.price,
      currency: updatedService.currency,
      location: updatedService.location,
      image: updatedService.image,
      is_active: updatedService.is_active,
      created_at: updatedService.created_at,
      updated_at: updatedService.updated_at,
      provider: {
        id: updatedService.provider.id,
        name: `${updatedService.provider.first_name} ${updatedService.provider.last_name}`,
        image: updatedService.provider.profile_image,
        rating: updatedService.provider.rating,
        reviewCount: updatedService.provider.review_count
      }
    }

    res.json(formattedService)
  } catch (error) {
    console.error('Error updating service:', error)
    res.status(500).json({ 
      message: 'Error updating service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Delete service
router.delete('/:id', auth, async (req, res) => {
  try {
    // Verify ownership
    const { data: service, error: checkError } = await supabase
      .from('services')
      .select('user_id, image')
      .eq('id', req.params.id)
      .single()

    if (checkError || !service) {
      return res.status(404).json({ message: 'Service not found' })
    }

    if (service.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this service' })
    }

    // Delete image from storage if exists
    if (service.image) {
      const imagePath = service.image.split('/').slice(-2).join('/')
      try {
        await supabase.storage
          .from('service-uploads')
          .remove([imagePath])
      } catch (deleteError) {
        console.warn('Could not delete service image:', deleteError)
      }
    }

    // Delete service
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', req.params.id)

    if (deleteError) throw deleteError

    res.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    res.status(500).json({ 
      message: 'Error deleting service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router 