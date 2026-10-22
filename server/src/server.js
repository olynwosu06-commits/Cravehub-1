// Add this at the VERY TOP of src/server.js, before anything else
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

console.log('DNS servers set to public ones');
const express = require("express");
const mongoose = require("mongoose");
const menuRoutes = require('./routes/menuRoutes');
const cors = require("cors");
require("dotenv").config();
const cartRoutes = require('./routes/cartRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const productRoutes = require("./routes/productsRoutes");

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());
const allowedOrigins = [
  'https://cravehub-1-client.vercel.app',
  'http://localhost:5173', // your local frontend port, adjust if different
];

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/cravehub-1-client-.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// MongoDB URI
const MONGO_URI = process.env.MONGODB_URI;

// Check if URI exists
if (!MONGO_URI) {
    console.error("❌ MONGODB_URI is not defined in the .env file.");
    process.exit(1);
}

// Connect to MongoDB
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully!");
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:");
        console.error(err);
    });

// Test Route
app.get("/", (req, res) => {
    res.send("🚀 CraveHub API is running...");
});

// app.use("/api/products", productRoutes)
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});