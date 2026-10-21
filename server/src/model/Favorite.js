const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  sessionId: { type: String, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);