const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  uploadLogo,
  uploadQRCode,
  getPublicSettings,
  updateUPISettings,
} = require("../controllers/settingsController");
const { protect, authorize } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");

// ============== PUBLIC ROUTES ==============
router.get("/public", getPublicSettings);

// ============== ADMIN ROUTES ==============
router.get("/", protect, authorize("admin", "superadmin"), getSettings);
router.put("/", protect, authorize("admin", "superadmin"), updateSettings);

// UPI Settings route - Make sure this is BEFORE other routes
router.put(
  "/upi",
  protect,
  authorize("admin", "superadmin"),
  updateUPISettings,
);

router.post(
  "/logo",
  protect,
  authorize("admin", "superadmin"),
  uploadSingle("logo"),
  uploadLogo,
);

router.post(
  "/qr-code",
  protect,
  authorize("admin", "superadmin"),
  uploadSingle("qrCode"),
  uploadQRCode,
);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Settings route is working!" });
});

module.exports = router;
