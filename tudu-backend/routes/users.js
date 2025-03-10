const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you have a database module

// Search users by name
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const users = await db.query(
      'SELECT id, firstName, lastName, profileImage, rating FROM users WHERE firstName LIKE ? OR lastName LIKE ?',
      [`%${query}%`, `%${query}%`]
    );
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 