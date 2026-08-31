const Expense = require("../models/Expense");
const FestivalYear = require("../models/FestivalYear");

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private/Admin
exports.createExpense = async (req, res) => {
  try {
    const {
      name,
      category,
      amount,
      date,
      description,
      vendor,
      festivalYearId,
    } = req.body;

    // Validate required fields
    if (!name || !category || !amount || !date || !festivalYearId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate festival year
    const festivalYear = await FestivalYear.findById(festivalYearId);
    if (!festivalYear) {
      return res.status(404).json({
        success: false,
        message: "Festival year not found",
      });
    }

    const expense = new Expense({
      name,
      category,
      amount,
      date,
      description,
      vendor,
      festivalYear: festivalYearId,
      status: "PENDING",
    });

    await expense.save();

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create expense",
    });
  }
};

// @desc    Get all expenses (admin)
// @route   GET /api/expenses
// @access  Private/Admin
exports.getExpenses = async (req, res) => {
  try {
    const {
      category,
      status,
      festivalYearId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (festivalYearId) query.festivalYear = festivalYearId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { expenseId: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate("festivalYear", "year name")
        .populate("approvedBy", "name email")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get expenses",
    });
  }
};

// @desc    Get public expenses
// @route   GET /api/expenses/public
// @access  Public
exports.getPublicExpenses = async (req, res) => {
  try {
    const { festivalYearId, category } = req.query;

    const query = {
      status: "APPROVED",
    };

    if (festivalYearId) query.festivalYear = festivalYearId;
    if (category) query.category = category;

    const expenses = await Expense.find(query)
      .populate("festivalYear", "year name")
      .sort({ date: -1 });

    // Get totals by category
    const categoryTotals = await Expense.aggregate([
      { $match: { status: "APPROVED" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: expenses,
      categoryTotals,
    });
  } catch (error) {
    console.error("Get public expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public expenses",
    });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private/Admin
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id)
      .populate("festivalYear", "year name")
      .populate("approvedBy", "name email");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Get expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get expense",
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private/Admin
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Don't allow updating approved expenses
    if (expense.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Cannot update approved expense",
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedExpense,
    });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update expense",
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Don't allow deleting approved expenses
    if (expense.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete approved expense",
      });
    }

    await expense.remove();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
    });
  }
};

// @desc    Approve expense
// @route   PUT /api/expenses/:id/approve
// @access  Private/Admin
exports.approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    expense.status = status;
    expense.approvedBy = req.user.id;
    expense.approvedAt = new Date();

    await expense.save();

    // If approved, update festival year totals
    if (status === "APPROVED") {
      await FestivalYear.findByIdAndUpdate(expense.festivalYear, {
        $inc: { totalExpenses: expense.amount },
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Approve expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve expense",
    });
  }
};

// @desc    Upload bill
// @route   POST /api/expenses/:id/bill
// @access  Private/Admin
exports.uploadBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a bill",
      });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    expense.billUrl = req.file.path || req.file.url;
    expense.billFileName = req.file.originalname || req.file.filename;

    await expense.save();

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Upload bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload bill",
    });
  }
};
