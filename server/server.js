const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Routes - Make sure paths are correct
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/chanda", require("./routes/chanda"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/events", require("./routes/events"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/photos", require("./routes/photos"));
app.use("/api/videos", require("./routes/videos"));
app.use("/api/volunteers", require("./routes/volunteers"));

// Debug route - This should work
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// 404 handler - Make sure this is AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

module.exports = app;
