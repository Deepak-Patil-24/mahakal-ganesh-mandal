const Event = require("../models/Event");
const FestivalYear = require("../models/FestivalYear");

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
  try {
    const {
      festivalYearId,
      name,
      date,
      startTime,
      endTime,
      description,
      location,
      status,
      type,
      isFeatured,
    } = req.body;

    // Validate required fields
    if (!festivalYearId || !name || !date || !startTime || !type) {
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

    const eventData = {
      festivalYear: festivalYearId,
      name,
      date,
      startTime,
      endTime,
      description,
      location,
      type,
      isFeatured: isFeatured || false,
    };

    if (status) eventData.status = status;
    if (req.file) eventData.image = req.file.path || req.file.url;

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

// @desc    Get all events (admin)
// @route   GET /api/events
// @access  Private/Admin
exports.getEvents = async (req, res) => {
  try {
    const {
      festivalYearId,
      status,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (festivalYearId) query.festivalYear = festivalYearId;
    if (status) query.status = status;
    if (type) query.type = type;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("festivalYear", "year name")
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get events",
    });
  }
};

// @desc    Get public events
// @route   GET /api/events/public
// @access  Public
exports.getPublicEvents = async (req, res) => {
  try {
    const { festivalYearId } = req.query;

    const query = {};
    if (festivalYearId) query.festivalYear = festivalYearId;

    const events = await Event.find(query)
      .populate("festivalYear", "year name")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Get public events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public events",
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
exports.getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();

    const events = await Event.find({
      date: { $gte: now },
      status: { $in: ["UPCOMING", "ONGOING"] },
    })
      .populate("festivalYear", "year name")
      .sort({ date: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Get upcoming events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get upcoming events",
    });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate(
      "festivalYear",
      "year name",
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get event",
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (req.file) {
      updates.image = req.file.path || req.file.url;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await event.remove();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};
