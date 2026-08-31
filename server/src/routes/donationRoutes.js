const express = require("express");
const router = express.Router();

// Simple test route
router.get("/test", (req, res) => {
  res.json({ message: "Donation routes working!" });
});

// Public route - Create donation
router.post("/create", (req, res) => {
  res.json({ message: "Create donation endpoint" });
});

// Public route - Get public donations
router.get("/public", (req, res) => {
  res.json({ message: "Get public donations endpoint" });
});

// Protected route example (commented out until we have proper auth)
// router.get('/admin', protect, (req, res) => {
//     res.json({ message: 'Admin donation route' });
// });

module.exports = router;
