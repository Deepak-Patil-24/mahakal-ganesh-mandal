const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  uploadLogo,
  uploadQRCode,
  getPublicSettings,
} = require("../controllers/settingsController");
const { protect, authorize } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");

// Public routes
router.get("/public", getPublicSettings);

// Admin routes
router.get("/", protect, authorize("admin", "superadmin"), getSettings);
router.put("/", protect, authorize("admin", "superadmin"), updateSettings);
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

module.exports = router;
