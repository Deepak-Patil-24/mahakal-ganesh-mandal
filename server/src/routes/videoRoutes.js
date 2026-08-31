const express = require("express");
const router = express.Router();
const {
  createVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getPublicVideos,
  getVideosByYear,
} = require("../controllers/videoController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/public", getPublicVideos);
router.get("/year/:yearId", getVideosByYear);
router.get("/:id", getVideoById);

// Admin routes
router.post("/", protect, authorize("admin", "superadmin"), createVideo);
router.get("/", protect, authorize("admin", "superadmin"), getVideos);
router.put("/:id", protect, authorize("admin", "superadmin"), updateVideo);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteVideo);

module.exports = router;
