const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  id: { type: Number },  
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  category: { type: String, default: 'All' },
  group: { type: String, default: 'All' },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);