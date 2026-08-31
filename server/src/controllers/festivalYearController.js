const FestivalYear = require("../models/FestivalYear");
const Donation = require("../models/Donation");
const Expense = require("../models/Expense");

// @desc    Create festival year
// @route   POST /api/festival-years
// @access  Private/Admin
exports.createFestivalYear = async (req, res) => {
  try {
    const { year, startDate, endDate, theme, isActive } = req.body;

    // Validate required fields
    if (!year || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if year already exists
    const existingYear = await FestivalYear.findOne({ year });
    if (existingYear) {
      return res.status(400).json({
        success: false,
        message: "Year already exists",
      });
    }

    // If this is set as active, deactivate others
    if (isActive) {
      await FestivalYear.updateMany({ isActive: true }, { isActive: false });
    }

    const festivalYear = new FestivalYear({
      year,
      startDate,
      endDate,
      theme,
      isActive: isActive || false,
    });

    await festivalYear.save();

    res.status(201).json({
      success: true,
      data: festivalYear,
    });
  } catch (error) {
    console.error("Create festival year error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create festival year",
    });
  }
};

// @desc    Get all festival years (admin)
// @route   GET /api/festival-years
// @access  Private/Admin
exports.getFestivalYears = async (req, res) => {
  try {
    const festivalYears = await FestivalYear.find().sort({ year: -1 });

    res.status(200).json({
      success: true,
      data: festivalYears,
    });
  } catch (error) {
    console.error("Get festival years error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get festival years",
    });
  }
};

// @desc    Get active festival year
// @route   GET /api/festival-years/active
// @access  Public
exports.getActiveFestivalYear = async (req, res) => {
  try {
    const festivalYear = await FestivalYear.findOne({ isActive: true });

    if (!festivalYear) {
      return res.status(404).json({
        success: false,
        message: "No active festival year found",
      });
    }

    // Get stats
    const stats = await getYearStats(festivalYear._id);

    res.status(200).json({
      success: true,
      data: {
        ...festivalYear.toObject(),
        stats,
      },
    });
  } catch (error) {
    console.error("Get active festival year error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active festival year",
    });
  }
};

// @desc    Get festival year by ID
// @route   GET /api/festival-years/:id
// @access  Public
exports.getFestivalYearById = async (req, res) => {
  try {
    const { id } = req.params;

    const festivalYear = await FestivalYear.findById(id);
    if (!festivalYear) {
      return res.status(404).json({
        success: false,
        message: "Festival year not found",
      });
    }

    res.status(200).json({
      success: true,
      data: festivalYear,
    });
  } catch (error) {
    console.error("Get festival year error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get festival year",
    });
  }
};

// @desc    Get festival year stats
// @route   GET /api/festival-years/:id/stats
// @access  Public
exports.getFestivalYearStats = async (req, res) => {
  try {
    const { id } = req.params;

    const festivalYear = await FestivalYear.findById(id);
    if (!festivalYear) {
      return res.status(404).json({
        success: false,
        message: "Festival year not found",
      });
    }

    const stats = await getYearStats(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get festival year stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get festival year stats",
    });
  }
};

// @desc    Update festival year
// @route   PUT /api/festival-years/:id
// @access  Private/Admin
exports.updateFestivalYear = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const festivalYear = await FestivalYear.findById(id);
    if (!festivalYear) {
      return res.status(404).json({
        success: false,
        message: "Festival year not found",
      });
    }

    // If setting as active, deactivate others
    if (updates.isActive) {
      await FestivalYear.updateMany(
        { _id: { $ne: id }, isActive: true },
        { isActive: false },
      );
    }

    const updatedFestivalYear = await FestivalYear.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: updatedFestivalYear,
    });
  } catch (error) {
    console.error("Update festival year error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update festival year",
    });
  }
};

// @desc    Delete festival year
// @route   DELETE /api/festival-years/:id
// @access  Private/Admin
exports.deleteFestivalYear = async (req, res) => {
  try {
    const { id } = req.params;

    const festivalYear = await FestivalYear.findById(id);
    if (!festivalYear) {
      return res.status(404).json({
        success: false,
        message: "Festival year not found",
      });
    }

    // Check if there are any donations or expenses
    const donations = await Donation.countDocuments({ festivalYear: id });
    const expenses = await Expense.countDocuments({ festivalYear: id });

    if (donations > 0 || expenses > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete festival year with existing donations or expenses",
      });
    }

    await festivalYear.remove();

    res.status(200).json({
      success: true,
      message: "Festival year deleted successfully",
    });
  } catch (error) {
    console.error("Delete festival year error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete festival year",
    });
  }
};

// Helper function to get year stats
async function getYearStats(festivalYearId) {
  const [donations, expenses] = await Promise.all([
    Donation.aggregate([
      { $match: { festivalYear: festivalYearId, status: "VERIFIED" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Expense.aggregate([
      { $match: { festivalYear: festivalYearId, status: "APPROVED" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const donationTotal = donations.length > 0 ? donations[0].totalAmount : 0;
  const donationCount = donations.length > 0 ? donations[0].count : 0;
  const expenseTotal = expenses.length > 0 ? expenses[0].totalAmount : 0;
  const expenseCount = expenses.length > 0 ? expenses[0].count : 0;

  return {
    totalDonations: donationTotal,
    totalExpenses: expenseTotal,
    balance: donationTotal - expenseTotal,
    donorCount: donationCount,
    expenseCount: expenseCount,
  };
}
