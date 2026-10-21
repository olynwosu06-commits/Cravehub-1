const express = require('express');
const Order = require('../model/Order');
const Booking = require('../model/Booking');
const User = require('../model/User');
const MenuItem = require('../model/MenuItem'); // 👈 Added for menu management
const Group = require('../model/Group');
const Category = require('../model/Category');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// 👇 PUT YOUR ADMIN EMAIL HERE
const ADMIN_EMAIL = 'emmaprime@gmail.com'; 

// Middleware: Check if the logged-in user is the admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error checking admin status' });
  }
};

router.use(requireAuth);
router.use(isAdmin);

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Sum up all successful order totals
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });

    res.json({
      totalOrders,
      totalUsers,
      totalRevenue,
      todayOrders,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==========================================
// 2. MENU MANAGEMENT
// ==========================================
// GET all menu items
router.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// POST create a new menu item
router.post('/menu', async (req, res) => {
  try {
    const { name, description, price, image, rating, category, group } = req.body;
    
    // Basic validation
    if (!name || !price || !image) {
      return res.status(400).json({ error: 'Name, price, and image are required' });
    }

    const newItem = await MenuItem.create({
      name, description, price: Number(price), image,
      rating: Number(rating) || 0, category, group
    });
    
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// DELETE a menu item
router.delete('/menu/:id', async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// ==========================================
// 3. ORDER MANAGEMENT
// ==========================================
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ==========================================
// 4. USER MANAGEMENT
// ==========================================
router.get('/users', async (req, res) => {
  try {
    // Fetch all users, but NEVER send the password field
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ==========================================
// 5. BOOKING MANAGEMENT
// ==========================================
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1, time: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// ==========================================
// 6. GROUP & CATEGORY MANAGEMENT
// ==========================================

// GET all groups (and populate their categories)
router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: 1 });
    const categories = await Category.find();
    res.json({ groups, categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// PUT update an existing menu item
router.put('/menu/:id', async (req, res) => {
  try {
    const { name, description, price, image, rating, category, group } = req.body;
    
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price: Number(price),
        image,
        rating: Number(rating) || 0,
        category,
        group
      },
      { new: true } // Return the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('PUT /api/admin/menu error:', err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// POST create a new group
router.post('/groups', async (req, res) => {
  try {
    const { name } = req.body;
    const newGroup = await Group.create({ name, icon: 'bx-food-menu' });
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(400).json({ error: 'Group already exists or failed' });
  }
});

// POST create a new category inside a group
router.post('/categories', async (req, res) => {
  try {
    const { name, groupId } = req.body;
    const newCategory = await Category.create({ name, group: groupId });
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: 'Category already exists in this group' });
  }
});


// DELETE a group (and all its categories)
router.delete('/groups/:id', async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // First, delete all categories belonging to this group
    await Category.deleteMany({ group: groupId });
    
    // Then delete the group itself
    await Group.findByIdAndDelete(groupId);
    
    res.json({ success: true, message: 'Group and its categories deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// DELETE a single category
router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});
module.exports = router;