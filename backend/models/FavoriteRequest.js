const mongoose = require('mongoose');

const favoriteRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure a user can't favorite the same request twice
favoriteRequestSchema.index({ userId: 1, requestId: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteRequest', favoriteRequestSchema); 