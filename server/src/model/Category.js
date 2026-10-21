const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }
}, { timestamps: true });

// Prevent duplicate categories within the same group
categorySchema.index({ name: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);