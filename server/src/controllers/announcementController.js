const Announcement = require("../models/Announcement");
const FestivalYear = require("../models/FestivalYear");

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      festivalYearId,
      title,
      content,
      type,
      priority,
      isPublished,
      isFeatured,
      expiresAt,
    } = req.body;

    // Validate required fields
    if (!festivalYearId || !title || !content) {
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

    const announcement = new Announcement({
      festivalYear: festivalYearId,
      title,
      content,
      type: type || "General",
      priority: priority || "Medium",
      isPublished: isPublished !== undefined ? isPublished : true,
      isFeatured: isFeatured || false,
      expiresAt,
      createdBy: req.user.id,
    });

    if (req.file) {
      announcement.image = req.file.path || req.file.url;
    }

    await announcement.save();

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

// @desc    Get all announcements (admin)
// @route   GET /api/announcements
// @access  Private/Admin
exports.getAnnouncements = async (req, res) => {
  try {
    const {
      festivalYearId,
      type,
      priority,
      isPublished,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (festivalYearId) query.festivalYear = festivalYearId;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (isPublished !== undefined) query.isPublished = isPublished === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate("festivalYear", "year name")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Announcement.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get announcements",
    });
  }
};

// @desc    Get public announcements
// @route   GET /api/announcements/public
// @access  Public
exports.getPublicAnnouncements = async (req, res) => {
  try {
    const { festivalYearId, limit = 10 } = req.query;

    const query = { isPublished: true };
    if (festivalYearId) query.festivalYear = festivalYearId;

    const announcements = await Announcement.find(query)
      .populate("festivalYear", "year name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get public announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public announcements",
    });
  }
};

// @desc    Get featured announcements
// @route   GET /api/announcements/featured
// @access  Public
exports.getFeaturedAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isPublished: true,
      isFeatured: true,
    })
      .populate("festivalYear", "year name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get featured announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get featured announcements",
    });
  }
};

// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Public
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate("festivalYear", "year name")
      .populate("createdBy", "name");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Increment views
    announcement.views += 1;
    await announcement.save();

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get announcement",
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    if (req.file) {
      updates.image = req.file.path || req.file.url;
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await announcement.remove();

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};
