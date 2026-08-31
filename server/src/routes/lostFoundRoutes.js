const express = require("express");
const router = express.Router();
const {
  createLostFound,
  getLostFound,
  getLostFoundById,
  updateLostFound,
  deleteLostFound,
  getPublicLostFound,
  resolveLostFound,
} = require("../controllers/lostFoundController");
const { protect, authorize } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");

// Public routes
router.get("/public", getPublicLostFound);

// Admin routes
router.post(
  "/",
  protect,
  authorize("admin", "superadmin"),
  uploadSingle("image"),
  createLostFound,
);
router.get("/", protect, authorize("admin", "superadmin"), getLostFound);
router.get("/:id", protect, authorize("admin", "superadmin"), getLostFoundById);
router.put(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  uploadSingle("image"),
  updateLostFound,
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  deleteLostFound,
);
router.put(
  "/:id/resolve",
  protect,
  authorize("admin", "superadmin"),
  resolveLostFound,
);

module.exports = router;
