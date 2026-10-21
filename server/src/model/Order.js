const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },        // snapshot at order time
  price: { type: Number, required: true },       // snapshot at order time
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Who placed it — either a user or a guest email
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  guestEmail: { type: String, default: null },


  orderType: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery',
  },

  // Delivery info
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: false },
    notes: { type: String, default: '' },
  },

  paymentReference: { type: String, default: null },
    paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },

  // Order contents
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },

  // Status for later (admin panel, order tracking)
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);