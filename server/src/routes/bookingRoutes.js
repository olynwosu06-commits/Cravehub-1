const express = require('express');
const Booking = require('../model/Booking');
const { ensureSession } = require('../middleware/session');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(ensureSession);

// POST /api/bookings — create a new booking
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, notes } = req.body;

    if (!name || !email || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    const booking = await Booking.create({
      userId: req.userId || null,
      guestEmail: req.userId ? null : email,
      name,
      email,
      phone,
      date,
      time,
      guests: Number(guests),
      notes: notes || '',
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error('POST /api/bookings error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings/mine — get logged-in user's bookings
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).sort({ date: -1, time: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('GET /api/bookings/mine error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id — get single booking (for confirmation page)
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error('GET /api/bookings/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

module.exports = router;