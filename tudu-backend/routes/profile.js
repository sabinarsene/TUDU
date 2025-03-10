const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const db = require('../db')
const auth = require('../middleware/auth')

// Configurare multer pentru încărcarea imaginilor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/profile')
    // Creează directorul dacă nu există
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4()
    const extension = path.extname(file.originalname).toLowerCase()
    cb(null, `${uniqueId}${extension}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and WebP are allowed.'))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
})

// Endpoint pentru vizualizarea profilului unui utilizator
router.get('/:userId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, first_name, last_name, email, profile_image, location, 
              member_since, rating, review_count, occupation, education, 
              age, bio, specialization, experience, languages, availability,
              is_provider
       FROM users 
       WHERE id = $1`,
      [req.params.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = result.rows[0]
    
    // Obține și serviciile utilizatorului
    const servicesResult = await db.query(
      `SELECT s.*, 
              COUNT(DISTINCT r.id) as review_count,
              AVG(r.rating)::numeric(3,1) as avg_rating
       FROM services s
       LEFT JOIN reviews r ON r.service_id = s.id
       WHERE s.provider_id = $1
       GROUP BY s.id`,
      [req.params.userId]
    )

    // Formatăm datele pentru răspuns
    const responseData = {
      ...user,
      profileImage: user.profile_image,
      firstName: user.first_name,
      lastName: user.last_name,
      memberSince: user.member_since,
      reviewCount: user.review_count,
      services: servicesResult.rows
    }

    res.json(responseData)
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
    const result = await db.query(
      `UPDATE users 
       SET occupation = $1, 
           education = $2, 
           age = $3, 
           location = $4, 
           bio = $5, 
           specialization = $6, 
           experience = $7, 
           languages = $8, 
           availability = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING id, first_name, last_name, email, profile_image, location, 
                 member_since, rating, review_count, occupation, education, 
                 age, bio, specialization, experience, languages, availability`,
      [
        occupation,
        education,
        age,
        location,
        bio,
        specialization,
        experience,
        languages,
        availability,
        req.user.id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const updatedUser = {
      ...result.rows[0],
      profileImage: result.rows[0].profile_image,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      memberSince: result.rows[0].member_since,
      reviewCount: result.rows[0].review_count
    }

    console.log('Profile updated:', updatedUser)
    res.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ message: 'Server error: ' + error.message })
  }
})

// Endpoint pentru încărcarea imaginii de profil
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Received file upload request:', req.file)

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Construiește calea relativă pentru imagine
    const imageUrl = `/uploads/profile/${path.basename(req.file.path)}`
    console.log('Image URL:', imageUrl)

    // Actualizează URL-ul imaginii de profil în baza de date
    const result = await db.query(
      `UPDATE users 
       SET profile_image = $1 
       WHERE id = $2 
       RETURNING id, first_name, last_name, email, profile_image, location, member_since, rating, review_count`,
      [imageUrl, req.user.id]
    )

    if (result.rows.length === 0) {
      // Șterge fișierul încărcat dacă utilizatorul nu există
      fs.unlinkSync(req.file.path)
      return res.status(404).json({ message: 'User not found' })
    }

    // Șterge imaginea veche dacă există
    if (req.user.profile_image) {
      const oldImagePath = path.join(__dirname, '../public', req.user.profile_image)
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath)
      }
    }

    const updatedUser = {
      ...result.rows[0],
      profileImage: imageUrl
    }

    console.log('Updated user:', updatedUser)

    res.json({
      user: updatedUser,
      imageUrl: imageUrl
    })
  } catch (error) {
    console.error('Error uploading profile image:', error)
    // Șterge fișierul încărcat în caz de eroare
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: 'Server error: ' + error.message })
  }
})

// Endpoint pentru a obține data de membru
router.get('/member-since', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT member_since FROM users WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ memberSince: result.rows[0].member_since })
  } catch (error) {
    console.error('Error fetching member since date:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router 