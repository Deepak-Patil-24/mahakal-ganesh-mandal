const Donation = require("../models/Donation");
const Expense = require("../models/Expense");
const FestivalYear = require("../models/FestivalYear");

// @desc    Generate financial report
// @route   GET /api/reports/financial
// @access  Private/Admin
exports.generateFinancialReport = async (req, res) => {
  try {
    const { festivalYearId } = req.query;

    if (!festivalYearId) {
      return res.status(400).json({
        success: false,
        message: "Please provide festival year ID",
      });
    }

    const festivalYear = await FestivalYear.findById(festivalYearId);
    if (!festivalYear) {
      return res.status(404).json({
        success: false,
        message: "Festival year not found",
      });
    }

    // Get verified donations
    const donations = await Donation.find({
      festivalYear: festivalYearId,
      status: "VERIFIED",
    }).sort({ createdAt: 1 });

    // Get approved expenses
    const expenses = await Expense.find({
      festivalYear: festivalYearId,
      status: "APPROVED",
    }).sort({ date: 1 });

    // Calculate totals
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalDonations - totalExpenses;

    // Donations by payment method
    const paymentMethodBreakdown = {};
    donations.forEach((d) => {
      if (!paymentMethodBreakdown[d.paymentMethod]) {
        paymentMethodBreakdown[d.paymentMethod] = 0;
      }
      paymentMethodBreakdown[d.paymentMethod] += d.amount;
    });

    // Expenses by category
    const expenseCategoryBreakdown = {};
    expenses.forEach((e) => {
      if (!expenseCategoryBreakdown[e.category]) {
        expenseCategoryBreakdown[e.category] = 0;
      }
      expenseCategoryBreakdown[e.category] += e.amount;
    });

    const report = {
      title: `${festivalYear.name} - Financial Report`,
      festivalYear: {
        year: festivalYear.year,
        name: festivalYear.name,
        startDate: festivalYear.startDate,
        endDate: festivalYear.endDate,
      },
      summary: {
        totalDonations,
        totalExpenses,
        balance,
        donorCount: donations.length,
        expenseCount: expenses.length,
      },
      paymentMethodBreakdown,
      expenseCategoryBreakdown,
      donations: donations.map((d) => ({
        date: d.createdAt,
        donorName: d.isAnonymous ? "Anonymous" : d.donorName,
        amount: d.amount,
        paymentMethod: d.paymentMethod,
        receiptNumber: d.receiptNumber,
      })),
      expenses: expenses.map((e) => ({
        date: e.date,
        name: e.name,
        category: e.category,
        amount: e.amount,
        vendor: e.vendor,
      })),
      generatedAt: new Date(),
    };

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Generate financial report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate financial report",
    });
  }
};

// @desc    Get financial summary
// @route   GET /api/reports/financial-summary
// @access  Private/Admin
exports.getFinancialSummary = async (req, res) => {
  try {
    const { festivalYearId } = req.query;

    const matchCondition = {};
    if (festivalYearId) {
      matchCondition.festivalYear = festivalYearId;
    }

    // Get donation summary
    const donationSummary = await Donation.aggregate([
      { $match: { ...matchCondition, status: "VERIFIED" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" },
        },
      },
    ]);

    // Get expense summary
    const expenseSummary = await Expense.aggregate([
      { $match: { ...matchCondition, status: "APPROVED" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" },
        },
      },
    ]);

    // Get daily donation trend
    const dailyTrend = await Donation.aggregate([
      { $match: { ...matchCondition, status: "VERIFIED" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        donations: donationSummary[0] || {
          total: 0,
          count: 0,
          avgAmount: 0,
          minAmount: 0,
          maxAmount: 0,
        },
        expenses: expenseSummary[0] || {
          total: 0,
          count: 0,
          avgAmount: 0,
          minAmount: 0,
          maxAmount: 0,
        },
        balance:
          (donationSummary[0]?.total || 0) - (expenseSummary[0]?.total || 0),
        dailyTrend,
      },
    });
  } catch (error) {
    console.error("Get financial summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get financial summary",
    });
  }
};

// @desc    Get donation report
// @route   GET /api/reports/donations
// @access  Private/Admin
exports.getDonationReport = async (req, res) => {
  try {
    const { festivalYearId, startDate, endDate, paymentMethod, status } =
      req.query;

    const query = {};
    if (festivalYearId) query.festivalYear = festivalYearId;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const donations = await Donation.find(query)
      .populate("festivalYear", "year name")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: donations,
      total: donations.length,
      totalAmount: donations.reduce(
        (sum, d) => sum + (d.status === "VERIFIED" ? d.amount : 0),
        0,
      ),
    });
  } catch (error) {
    console.error("Get donation report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get donation report",
    });
  }
};

// @desc    Get expense report
// @route   GET /api/reports/expenses
// @access  Private/Admin
exports.getExpenseReport = async (req, res) => {
  try {
    const { festivalYearId, startDate, endDate, category, status } = req.query;

    const query = {};
    if (festivalYearId) query.festivalYear = festivalYearId;
    if (category) query.category = category;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate("festivalYear", "year name")
      .populate("approvedBy", "name email")
      .sort({ date: -1 });

    // Group by category
    const categorySummary = {};
    expenses.forEach((e) => {
      if (e.status === "APPROVED") {
        if (!categorySummary[e.category]) {
          categorySummary[e.category] = 0;
        }
        categorySummary[e.category] += e.amount;
      }
    });

    res.status(200).json({
      success: true,
      data: expenses,
      total: expenses.length,
      totalAmount: expenses.reduce(
        (sum, e) => sum + (e.status === "APPROVED" ? e.amount : 0),
        0,
      ),
      categorySummary,
    });
  } catch (error) {
    console.error("Get expense report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get expense report",
    });
  }
};
