const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getPublicAnnouncements,
  getFeaturedAnnouncements,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");

// Public routes
router.get("/public", getPublicAnnouncements);
router.get("/featured", getFeaturedAnnouncements);
router.get("/:id", getAnnouncementById);

// Admin routes
router.post(
  "/",
  protect,
  authorize("admin", "superadmin"),
  uploadSingle("image"),
  createAnnouncement,
);
router.get("/", protect, authorize("admin", "superadmin"), getAnnouncements);
router.put(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  uploadSingle("image"),
  updateAnnouncement,
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  deleteAnnouncement,
);

module.exports = router;
