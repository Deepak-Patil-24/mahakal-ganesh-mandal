const express = require("express");
const router = express.Router();
const {
  createFestivalYear,
  getFestivalYears,
  getFestivalYearById,
  updateFestivalYear,
  deleteFestivalYear,
  getActiveFestivalYear,
  getFestivalYearStats,
} = require("../controllers/festivalYearController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/active", getActiveFestivalYear);
router.get("/:id", getFestivalYearById);
router.get("/:id/stats", getFestivalYearStats);

// Admin routes
router.post("/", protect, authorize("admin", "superadmin"), createFestivalYear);
router.get("/", protect, authorize("admin", "superadmin"), getFestivalYears);
router.put(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  updateFestivalYear,
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  deleteFestivalYear,
);

module.exports = router;
