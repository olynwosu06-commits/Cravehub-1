const express = require('express');
const Cart = require('../model/Cart');
const MenuItem = require('../model/MenuItem');
const { ensureSession } = require('../middleware/session');

const router = express.Router();

router.use(ensureSession);

// Helper: find the cart for this request (by user or session)
async function findCartForRequest(req) {
  if (req.userId) {
    return Cart.findOne({ userId: req.userId });
  }
  return Cart.findOne({ sessionId: req.sessionId, userId: null });
}

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    let cart = await findCartForRequest(req);
    if (!cart) {
      cart = await Cart.create({
        sessionId: req.sessionId,
        userId: req.userId || null,
        items: [],
      });
    }
    await cart.populate('items.menuItemId');
    res.json(cart);
  } catch (err) {
    console.error('GET /api/cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart/add
router.post('/add', async (req, res) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;
    if (!menuItemId) return res.status(400).json({ error: 'menuItemId is required' });

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });

    let cart = await findCartForRequest(req);
    if (!cart) {
      cart = new Cart({
        sessionId: req.sessionId,
        userId: req.userId || null,
        items: [],
      });
    }

    const existing = cart.items.find((i) => i.menuItemId.toString() === menuItemId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ menuItemId, quantity });
    }

    await cart.save();
    await cart.populate('items.menuItemId');
    res.json(cart);
  } catch (err) {
    console.error('POST /api/cart/add error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PATCH /api/cart/update
router.patch('/update', async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    if (!menuItemId || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'menuItemId and quantity are required' });
    }

    const cart = await findCartForRequest(req);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find((i) => i.menuItemId.toString() === menuItemId);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.menuItemId.toString() !== menuItemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.menuItemId');
    res.json(cart);
  } catch (err) {
    console.error('PATCH /api/cart/update error:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE /api/cart/remove/:menuItemId
router.delete('/remove/:menuItemId', async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const cart = await findCartForRequest(req);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.menuItemId.toString() !== menuItemId);
    await cart.save();
    await cart.populate('items.menuItemId');
    res.json(cart);
  } catch (err) {
    console.error('DELETE /api/cart/remove error:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// DELETE /api/cart/clear
router.delete('/clear', async (req, res) => {
  try {
    const cart = await findCartForRequest(req);
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, items: [] });
  } catch (err) {
    console.error('DELETE /api/cart/clear error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;