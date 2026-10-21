const express = require('express');
const axios = require('axios');
const { ensureSession } = require('../middleware/session');

const router = express.Router();

const PAYSTACK_BASE = 'https://api.paystack.co';

// Helper: Paystack API call with auth header
function paystack(endpoint, { method = 'GET', data } = {}) {
  return axios({
    method,
    url: `${PAYSTACK_BASE}${endpoint}`,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    data,
  });
}

router.use(ensureSession);

// POST /api/payments/initialize
// Body: { email, amount }  (amount in Naira)
// Returns: { reference, access_code, public_key }
router.post('/initialize', async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: 'email and amount are required' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    // Paystack expects the amount in kobo (kobo = Naira * 100)
    const amountInKobo = Math.round(amount * 100);

    const { data } = await paystack('/transaction/initialize', {
      method: 'POST',
      data: {
        email,
        amount: amountInKobo,
        // Optional: you can attach metadata for later use
        metadata: {
          sessionId: req.sessionId,
          userId: req.userId || null,
        },
      },
    });

    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Paystack initialize failed' });
    }

    res.json({
      reference: data.data.reference,
      access_code: data.data.access_code,
      public_key: process.env.PAYSTACK_PUBLIC_KEY,
    });
  } catch (err) {
    console.error('POST /api/payments/initialize error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// GET /api/payments/verify/:reference
// Confirms with Paystack that the payment actually succeeded
// Returns: { verified: true/false, amount, reference, ... }
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ error: 'reference is required' });
    }

    const { data } = await paystack(`/transaction/verify/${reference}`);

    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Verification failed' });
    }

    const tx = data.data;
    const success = tx.status === 'success';

    res.json({
      verified: success,
      amount: tx.amount / 100,        // convert kobo back to Naira
      reference: tx.reference,
      status: tx.status,
      paidAt: tx.paid_at,
      email: tx.customer?.email,
    });
  } catch (err) {
    console.error('GET /api/payments/verify error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router;