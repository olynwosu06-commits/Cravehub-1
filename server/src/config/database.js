// Add this at the VERY TOP of src/server.js, before anything else
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

console.log('DNS servers set to public ones');
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
// const productRoutes = require("./routes/productsRoutes");

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());
app.use(cors());

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

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
}); 