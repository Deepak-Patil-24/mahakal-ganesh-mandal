const express = require("express");
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  approveExpense,
  getPublicExpenses,
  uploadBill,
} = require("../controllers/expenseController");
const { protect, authorize } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");

// Public routes
router.get("/public", getPublicExpenses);

// Admin routes
router.post("/", protect, authorize("admin", "superadmin"), createExpense);
router.get("/", protect, authorize("admin", "superadmin"), getExpenses);
router.get("/:id", protect, authorize("admin", "superadmin"), getExpenseById);
router.put("/:id", protect, authorize("admin", "superadmin"), updateExpense);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteExpense);
router.put(
  "/:id/approve",
  protect,
  authorize("admin", "superadmin"),
  approveExpense,
);
router.post(
  "/:id/bill",
  protect,
  authorize("admin", "superadmin"),
  uploadSingle("bill"),
  uploadBill,
);

module.exports = router;
