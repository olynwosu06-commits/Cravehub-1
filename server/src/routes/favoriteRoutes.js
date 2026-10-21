const express = require('express');
const Favorite = require('../model/Favorite');
const MenuItem = require('../model/MenuItem');
const { ensureSession } = require('../middleware/session');

const router = express.Router();

router.use(ensureSession);

// Build a query filter based on user or session
function ownerFilter(req) {
  if (req.userId) return { userId: req.userId };
  return { sessionId: req.sessionId, userId: null };
}

// GET /api/favorites
router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find(ownerFilter(req)).populate('menuItemId');
    res.json(favorites);
  } catch (err) {
    console.error('GET /api/favorites error:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /api/favorites/toggle
router.post('/toggle', async (req, res) => {
  try {
    const { menuItemId } = req.body;
    if (!menuItemId) return res.status(400).json({ error: 'menuItemId is required' });

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });

    const filter = { ...ownerFilter(req), menuItemId };

    // 1. Try to remove it. If it existed, we're done (toggled "off").
    const deleted = await Favorite.findOneAndDelete(filter);

    // 2. If nothing was deleted, try to create it (toggled "on").
    if (!deleted) {
      try {
        await Favorite.create({
          sessionId: req.sessionId,
          userId: req.userId || null,
          menuItemId,
        });
      } catch (err) {
        // 11000 = duplicate key. This happens when two requests
        // race to add the same favorite. We can safely ignore it —
        // the favorite is already there.
        if (err.code !== 11000) throw err;
      }
    }

    // 3. Return the current list
    const favorites = await Favorite.find(ownerFilter(req)).populate('menuItemId');
    res.json(favorites);
  } catch (err) {
    console.error('POST /api/favorites/toggle error:', err);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// DELETE /api/favorites/clear
router.delete('/clear', async (req, res) => {
  try {
    await Favorite.deleteMany(ownerFilter(req));
    res.json({ success: true, favorites: [] });
  } catch (err) {
    console.error('DELETE /api/favorites/clear error:', err);
    res.status(500).json({ error: 'Failed to clear favorites' });
  }
});

module.exports = router;