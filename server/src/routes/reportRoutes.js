const express = require("express");
const router = express.Router();
const {
  generateFinancialReport,
  getFinancialSummary,
  getDonationReport,
  getExpenseReport,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");

// Admin routes
router.get(
  "/financial",
  protect,
  authorize("admin", "superadmin"),
  generateFinancialReport,
);
router.get(
  "/financial-summary",
  protect,
  authorize("admin", "superadmin"),
  getFinancialSummary,
);
router.get(
  "/donations",
  protect,
  authorize("admin", "superadmin"),
  getDonationReport,
);
router.get(
  "/expenses",
  protect,
  authorize("admin", "superadmin"),
  getExpenseReport,
);

module.exports = router;
