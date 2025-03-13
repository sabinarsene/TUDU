const mongoose = require('mongoose');

const favoriteServiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure a user can't favorite the same service twice
favoriteServiceSchema.index({ userId: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteService', favoriteServiceSchema); 