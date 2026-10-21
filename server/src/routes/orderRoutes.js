const express = require('express');
const Order = require('../model/Order');
const MenuItem = require('../model/MenuItem');
const Cart = require('../model/Cart');
const { ensureSession } = require('../middleware/session');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(ensureSession);

// POST /api/orders — place an order
const axios = require('axios');

router.post('/', async (req, res) => {
  try {
    const { customer, notes, orderType = 'delivery', paymentReference } = req.body;

    // Basic validation
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    if (orderType === 'delivery' && !customer?.address) {
      return res.status(400).json({ error: 'Address is required for delivery' });
    }

    if (!paymentReference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    // Find the cart
    const cartFilter = req.userId
      ? { userId: req.userId }
      : { sessionId: req.sessionId, userId: null };

    const cart = await Cart.findOne(cartFilter).populate('items.menuItemId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Compute totals so we can verify the paid amount matches
    const items = cart.items.map((entry) => ({
      menuItemId: entry.menuItemId._id,
      name: entry.menuItemId.name,
      price: entry.menuItemId.price,
      quantity: entry.quantity,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let deliveryFee = 0;
    if (orderType === 'delivery') {
      deliveryFee = subtotal >= 10000 ? 0 : 500;
    }
    const total = subtotal + deliveryFee;

    // Verify with Paystack
    let paystackData;
    try {
      const { data } = await axios.get(
        `https://api.paystack.co/transaction/verify/${paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );
      paystackData = data;
    } catch (err) {
      console.error('Paystack verify error:', err.response?.data || err.message);
      return res.status(400).json({ error: 'Could not verify payment' });
    }

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment was not successful' });
    }

    const paidAmount = paystackData.data.amount / 100;   // kobo → Naira

    // Compare with a small tolerance (Paystack rounds, so allow 1 cent drift)
    if (Math.abs(paidAmount - total) > 0.01) {
      console.error(`Paid ${paidAmount} but expected ${total}`);
      return res.status(400).json({ error: 'Payment amount does not match order total' });
    }

    // Create the order
    const order = await Order.create({
      userId: req.userId || null,
      guestEmail: req.userId ? null : customer.email,
      orderType,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || '',
        notes: notes || '',
      },
      items,
      subtotal,
      deliveryFee,
      total,
      paymentReference,
      paymentStatus: 'paid',
      status: 'pending',
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('POST /api/orders error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/orders/mine — logged-in user's order history
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders/mine error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow cancelling "pending" or "confirmed" orders
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ error: 'This order can no longer be cancelled' });
    }

    // Optional: enforce a time limit (e.g., 15 minutes)
    const minutesSinceOrder = (Date.now() - order.createdAt.getTime()) / 60000;
    if (minutesSinceOrder > 15) {
      return res.status(400).json({ error: 'Cancellation window has passed (15 min limit)' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('PATCH /api/orders/:id/cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
}); 


// GET /api/orders/:id — fetch a single order (for the confirmation page)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('GET /api/orders/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});


module.exports = router;