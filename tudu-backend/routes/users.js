const express = require('express');
const router = express.Router();
const { supabase } = require('../db'); // Corectăm importul
const UserRating = require('../models/UserRating');
const { authenticateToken } = require('../middleware/auth');

// Search users by name
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    // Folosim supabase în loc de db.query
    const { data: users, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, profile_image, rating')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`);
    
    if (error) throw error;
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obține toate evaluările pentru un utilizator
router.get('/:userId/ratings', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`GET /users/${userId}/ratings - Obținere evaluări pentru utilizatorul ${userId}`);
    
    // Verificăm dacă utilizatorul există
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      console.log(`Utilizatorul ${userId} nu a fost găsit:`, userError);
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    
    console.log(`Utilizatorul ${userId} există, obținem evaluările...`);
    
    // Obținem evaluările utilizatorului
    const ratings = await UserRating.getRatingsForUser(userId);
    
    // Obținem ratingul mediu
    const { averageRating, reviewCount } = await UserRating.getAverageRating(userId);
    
    console.log(`S-au găsit ${ratings.length} evaluări pentru utilizatorul ${userId}`);
    console.log(`Rating mediu: ${averageRating}, Număr de evaluări: ${reviewCount}`);
    
    res.json({
      ratings,
      averageRating,
      reviewCount
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ message: 'A apărut o eroare la obținerea evaluărilor' });
  }
});

// Adaugă sau actualizează o evaluare pentru un utilizator
router.post('/:userId/ratings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating, comment } = req.body;
    const ratedBy = req.user.id;
    
    console.log(`POST /users/${userId}/ratings - Adăugare/actualizare evaluare pentru utilizatorul ${userId} de către ${ratedBy}`);
    console.log(`Rating: ${rating}, Comment: ${comment}`);
    
    // Validăm datele de intrare
    if (!rating || rating < 1 || rating > 5) {
      console.log(`Rating invalid: ${rating}`);
      return res.status(400).json({ message: 'Ratingul trebuie să fie între 1 și 5' });
    }
    
    // Verificăm dacă utilizatorul există
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      console.log(`Utilizatorul ${userId} nu a fost găsit:`, userError);
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    
    console.log(`Utilizatorul ${userId} există, adăugăm/actualizăm evaluarea...`);
    
    // Adăugăm sau actualizăm evaluarea
    const result = await UserRating.addOrUpdateRating(userId, ratedBy, rating, comment);
    
    console.log(`Evaluare adăugată/actualizată cu succes:`, result);
    
    res.status(201).json({
      message: 'Evaluarea a fost adăugată cu succes',
      rating: result
    });
  } catch (error) {
    console.error('Error adding user rating:', error);
    
    if (error.message === 'Nu îți poți evalua propriul profil') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'A apărut o eroare la adăugarea evaluării' });
  }
});

// Șterge o evaluare
router.delete('/:userId/ratings/:ratingId', authenticateToken, async (req, res) => {
  try {
    const { userId, ratingId } = req.params;
    const currentUserId = req.user.id;
    
    console.log(`DELETE /users/${userId}/ratings/${ratingId} - Ștergere evaluare ${ratingId} de către utilizatorul ${currentUserId}`);
    
    // Ștergem evaluarea
    await UserRating.deleteRating(ratingId, currentUserId);
    
    console.log(`Evaluarea ${ratingId} a fost ștearsă cu succes`);
    
    res.json({ message: 'Evaluarea a fost ștearsă cu succes' });
  } catch (error) {
    console.error('Error deleting user rating:', error);
    
    if (error.message === 'Nu ai permisiunea să ștergi această evaluare') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'A apărut o eroare la ștergerea evaluării' });
  }
});

module.exports = router; 