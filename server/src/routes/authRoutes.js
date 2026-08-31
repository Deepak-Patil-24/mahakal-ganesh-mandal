const express = require("express");
const router = express.Router();

// Simple login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Simple check for admin (for testing)
  if (email === "admin@mahakalganesh.com" && password === "Admin@123") {
    return res.json({
      success: true,
      token: "fake-jwt-token-for-testing",
      user: {
        id: "1",
        name: "Admin",
        email: "admin@mahakalganesh.com",
        role: "admin",
      },
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

// Verify token route
router.get("/verify", (req, res) => {
  res.json({
    success: true,
    user: {
      id: "1",
      name: "Admin",
      email: "admin@mahakalganesh.com",
      role: "admin",
    },
  });
});

module.exports = router;
