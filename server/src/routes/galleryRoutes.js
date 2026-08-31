const express = require("express");
const router = express.Router();
const {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  addPhotos,
  deletePhoto,
  getPublicAlbums,
  getAlbumPhotos,
} = require("../controllers/galleryController");
const { protect, authorize } = require("../middleware/auth");
const { uploadMultiple } = require("../middleware/upload");

// Public routes
router.get("/public", getPublicAlbums);
router.get("/public/:id/photos", getAlbumPhotos);
router.get("/:id", getAlbumById);

// Admin routes
router.post("/", protect, authorize("admin", "superadmin"), createAlbum);
router.get("/", protect, authorize("admin", "superadmin"), getAlbums);
router.put("/:id", protect, authorize("admin", "superadmin"), updateAlbum);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteAlbum);
router.post(
  "/:id/photos",
  protect,
  authorize("admin", "superadmin"),
  uploadMultiple("photos", 10),
  addPhotos,
);
router.delete(
  "/:albumId/photos/:photoId",
  protect,
  authorize("admin", "superadmin"),
  deletePhoto,
);

module.exports = router;
