const express = require("express");
const router = express.Router();
const {
  registerVolunteer,
  getVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
  getPublicVolunteers,
  updateVolunteerStatus,
} = require("../controllers/volunteerController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.post("/register", registerVolunteer);
router.get("/public", getPublicVolunteers);

// Admin routes
router.get("/", protect, authorize("admin", "superadmin"), getVolunteers);
router.get("/:id", protect, authorize("admin", "superadmin"), getVolunteerById);
router.put("/:id", protect, authorize("admin", "superadmin"), updateVolunteer);
router.delete(
  "/:id",
  protect,
  authorize("admin", "superadmin"),
  deleteVolunteer,
);
router.put(
  "/:id/status",
  protect,
  authorize("admin", "superadmin"),
  updateVolunteerStatus,
);

module.exports = router;
