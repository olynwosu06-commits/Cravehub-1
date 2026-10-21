const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, default: 'bx-food-menu' } // e.g. 'bx-restaurant', 'bx-drink'
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);