const LostFound = require("../models/LostFound");
const FestivalYear = require("../models/FestivalYear");

// @desc    Create lost/found item
// @route   POST /api/lost-found
// @access  Private/Admin
exports.createLostFound = async (req, res) => {
  try {
    const {
      festivalYearId,
      type,
      itemName,
      description,
      date,
      location,
      contact,
      status,
      notes,
    } = req.body;

    // Validate required fields
    if (!festivalYearId || !type || !itemName || !description || !date) {
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

    const lostFound = new LostFound({
      festivalYear: festivalYearId,
      type,
      itemName,
      description,
      date,
      location,
      contact,
      status: status || "OPEN",
      notes,
    });

    if (req.file) {
      lostFound.image = req.file.path || req.file.url;
    }

    await lostFound.save();

    res.status(201).json({
      success: true,
      data: lostFound,
    });
  } catch (error) {
    console.error("Create lost/found error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create lost/found item",
    });
  }
};

// @desc    Get all lost/found items (admin)
// @route   GET /api/lost-found
// @access  Private/Admin
exports.getLostFound = async (req, res) => {
  try {
    const { festivalYearId, type, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (festivalYearId) query.festivalYear = festivalYearId;
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      LostFound.find(query)
        .populate("festivalYear", "year name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      LostFound.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get lost/found error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get lost/found items",
    });
  }
};

// @desc    Get public lost/found items
// @route   GET /api/lost-found/public
// @access  Public
exports.getPublicLostFound = async (req, res) => {
  try {
    const { festivalYearId, type } = req.query;

    const query = { status: "OPEN" };
    if (festivalYearId) query.festivalYear = festivalYearId;
    if (type) query.type = type;

    const items = await LostFound.find(query)
      .populate("festivalYear", "year name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Get public lost/found error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public lost/found items",
    });
  }
};

// @desc    Get lost/found item by ID
// @route   GET /api/lost-found/:id
// @access  Private/Admin
exports.getLostFoundById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await LostFound.findById(id).populate(
      "festivalYear",
      "year name",
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Get lost/found item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get item",
    });
  }
};

// @desc    Update lost/found item
// @route   PUT /api/lost-found/:id
// @access  Private/Admin
exports.updateLostFound = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await LostFound.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (req.file) {
      updates.image = req.file.path || req.file.url;
    }

    const updatedItem = await LostFound.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Update lost/found error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item",
    });
  }
};

// @desc    Delete lost/found item
// @route   DELETE /api/lost-found/:id
// @access  Private/Admin
exports.deleteLostFound = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await LostFound.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    await item.remove();

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete lost/found error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
};

// @desc    Resolve lost/found item
// @route   PUT /api/lost-found/:id/resolve
// @access  Private/Admin
exports.resolveLostFound = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const item = await LostFound.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.status = "RESOLVED";
    item.resolvedAt = new Date();
    if (notes) item.notes = notes;

    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Resolve lost/found error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve item",
    });
  }
};
