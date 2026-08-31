const Donation = require("../models/Donation");
const FestivalYear = require("../models/FestivalYear");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Create donation
// @route   POST /api/donations/create
// @access  Public
exports.createDonation = async (req, res) => {
  try {
    const {
      donorName,
      amount,
      phone,
      email,
      isAnonymous,
      paymentMethod,
      festivalYearId,
    } = req.body;

    // Validate required fields
    if (!donorName || !amount || !paymentMethod || !festivalYearId) {
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

    // Check if festival year is active
    if (!festivalYear.isActive && !festivalYear.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Festival year is not active",
      });
    }

    // Create donation
    const donation = new Donation({
      donorName: isAnonymous ? "Anonymous" : donorName,
      amount,
      phone: isAnonymous ? undefined : phone,
      email: isAnonymous ? undefined : email,
      isAnonymous: isAnonymous || false,
      paymentMethod,
      festivalYear: festivalYearId,
      status: "PENDING",
    });

    await donation.save();

    // For QR Code payments, return QR code
    if (paymentMethod === "QR Code") {
      // Get settings for QR code
      const Settings = require("../models/Settings");
      const settings = await Settings.findOne();

      return res.status(201).json({
        success: true,
        data: {
          donation,
          qrCode: settings?.upiSettings?.qrCode || null,
          upiId: settings?.upiSettings?.upiId || null,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create donation",
    });
  }
};

// @desc    Verify donation (admin)
// @route   PUT /api/donations/:id/status
// @access  Private/Admin
exports.updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!["PENDING", "VERIFIED", "REJECTED", "FAILED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Update status
    donation.status = status;
    donation.verifiedBy = req.user.id;

    if (status === "VERIFIED") {
      donation.verifiedAt = new Date();

      // Update festival year totals
      await FestivalYear.findByIdAndUpdate(donation.festivalYear, {
        $inc: {
          totalDonations: donation.amount,
          donorCount: 1,
        },
      });
    }

    if (notes) {
      donation.notes = notes;
    }

    await donation.save();

    // Get updated festival year
    const festivalYear = await FestivalYear.findById(donation.festivalYear);

    res.status(200).json({
      success: true,
      data: {
        donation,
        festivalYear,
      },
    });
  } catch (error) {
    console.error("Update donation status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update donation status",
    });
  }
};

// @desc    Get all donations (admin)
// @route   GET /api/donations
// @access  Private/Admin
exports.getDonations = async (req, res) => {
  try {
    const {
      status,
      paymentMethod,
      festivalYearId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (festivalYearId) query.festivalYear = festivalYearId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { donorName: { $regex: search, $options: "i" } },
        { donationId: { $regex: search, $options: "i" } },
        { receiptNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donations, total] = await Promise.all([
      Donation.find(query)
        .populate("festivalYear", "year name")
        .populate("verifiedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Donation.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get donations",
    });
  }
};

// @desc    Get public donations
// @route   GET /api/donations/public
// @access  Public
exports.getPublicDonations = async (req, res) => {
  try {
    const { festivalYearId, limit = 50 } = req.query;

    const query = {
      status: "VERIFIED",
      isAnonymous: false,
    };

    if (festivalYearId) query.festivalYear = festivalYearId;

    const donations = await Donation.find(query)
      .select("donorName amount paymentMethod createdAt donationId")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get totals
    const totals = await Donation.aggregate([
      { $match: { status: "VERIFIED" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalDonors: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: donations,
      totals: totals[0] || { totalAmount: 0, totalDonors: 0 },
    });
  } catch (error) {
    console.error("Get public donations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public donations",
    });
  }
};

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Public/Admin
exports.getDonationById = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findById(id)
      .populate("festivalYear", "year name")
      .populate("verifiedBy", "name email");

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("Get donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get donation",
    });
  }
};

// @desc    Upload payment screenshot
// @route   POST /api/donations/:id/screenshot
// @access  Private/Admin
exports.uploadPaymentScreenshot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a screenshot",
      });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    donation.paymentScreenshot = req.file.path || req.file.url;
    await donation.save();

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("Upload screenshot error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload screenshot",
    });
  }
};

// @desc    Verify QR donation
// @route   POST /api/donations/verify-qr
// @access  Private/Admin
exports.verifyQrDonation = async (req, res) => {
  try {
    const { donationId, upiTransactionId } = req.body;

    if (!donationId || !upiTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide donation ID and UPI transaction ID",
      });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Check if transaction ID is already used
    const existingDonation = await Donation.findOne({ upiTransactionId });
    if (existingDonation) {
      return res.status(400).json({
        success: false,
        message: "This transaction ID is already used",
      });
    }

    donation.upiTransactionId = upiTransactionId;
    donation.status = "VERIFIED";
    donation.verifiedBy = req.user.id;
    donation.verifiedAt = new Date();

    await donation.save();

    // Update festival year totals
    await FestivalYear.findByIdAndUpdate(donation.festivalYear, {
      $inc: {
        totalDonations: donation.amount,
        donorCount: 1,
      },
    });

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("Verify QR donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify QR donation",
    });
  }
};
