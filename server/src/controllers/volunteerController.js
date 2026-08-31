const Volunteer = require("../models/Volunteer");
const FestivalYear = require("../models/FestivalYear");

// @desc    Register volunteer
// @route   POST /api/volunteers/register
// @access  Public
exports.registerVolunteer = async (req, res) => {
  try {
    const {
      festivalYearId,
      name,
      phone,
      area,
      preferredDuty,
      availability,
      notes,
    } = req.body;

    // Validate required fields
    if (!festivalYearId || !name || !phone) {
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

    const volunteer = new Volunteer({
      festivalYear: festivalYearId,
      name,
      phone,
      area,
      preferredDuty: preferredDuty || [],
      availability: availability || [],
      isActive: true,
      notes,
    });

    await volunteer.save();

    res.status(201).json({
      success: true,
      data: volunteer,
      message: "Volunteer registered successfully",
    });
  } catch (error) {
    console.error("Register volunteer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register volunteer",
    });
  }
};

// @desc    Get all volunteers (admin)
// @route   GET /api/volunteers
// @access  Private/Admin
exports.getVolunteers = async (req, res) => {
  try {
    const { festivalYearId, isActive, page = 1, limit = 20 } = req.query;

    const query = {};
    if (festivalYearId) query.festivalYear = festivalYearId;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [volunteers, total] = await Promise.all([
      Volunteer.find(query)
        .populate("festivalYear", "year name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Volunteer.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: volunteers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get volunteers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get volunteers",
    });
  }
};

// @desc    Get public volunteers (limited info)
// @route   GET /api/volunteers/public
// @access  Public
exports.getPublicVolunteers = async (req, res) => {
  try {
    const { festivalYearId } = req.query;

    const query = { isActive: true };
    if (festivalYearId) query.festivalYear = festivalYearId;

    const volunteers = await Volunteer.find(query)
      .populate("festivalYear", "year name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: volunteers,
    });
  } catch (error) {
    console.error("Get public volunteers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public volunteers",
    });
  }
};

// @desc    Get volunteer by ID
// @route   GET /api/volunteers/:id
// @access  Private/Admin
exports.getVolunteerById = async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findById(id).populate(
      "festivalYear",
      "year name",
    );

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    console.error("Get volunteer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get volunteer",
    });
  }
};

// @desc    Update volunteer
// @route   PUT /api/volunteers/:id
// @access  Private/Admin
exports.updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    const updatedVolunteer = await Volunteer.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedVolunteer,
    });
  } catch (error) {
    console.error("Update volunteer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update volunteer",
    });
  }
};

// @desc    Delete volunteer
// @route   DELETE /api/volunteers/:id
// @access  Private/Admin
exports.deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    await volunteer.remove();

    res.status(200).json({
      success: true,
      message: "Volunteer deleted successfully",
    });
  } catch (error) {
    console.error("Delete volunteer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete volunteer",
    });
  }
};

// @desc    Update volunteer status
// @route   PUT /api/volunteers/:id/status
// @access  Private/Admin
exports.updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide status",
      });
    }

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    volunteer.isActive = isActive;
    await volunteer.save();

    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    console.error("Update volunteer status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update volunteer status",
    });
  }
};
