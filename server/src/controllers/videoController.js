const Video = require("../models/Video");
const FestivalYear = require("../models/FestivalYear");

// @desc    Create video
// @route   POST /api/videos
// @access  Private/Admin
exports.createVideo = async (req, res) => {
  try {
    const {
      festivalYearId,
      title,
      description,
      url,
      type,
      event,
      duration,
      isPublished,
    } = req.body;

    // Validate required fields
    if (!festivalYearId || !title || !url) {
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

    // Extract video ID from YouTube URL
    let videoId = url;
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(youtubeRegex);
    if (match) {
      videoId = match[1];
    }

    const video = new Video({
      festivalYear: festivalYearId,
      title,
      description,
      url,
      videoId,
      type: type || "YOUTUBE",
      event,
      duration,
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    await video.save();

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Create video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create video",
    });
  }
};

// @desc    Get all videos (admin)
// @route   GET /api/videos
// @access  Private/Admin
exports.getVideos = async (req, res) => {
  try {
    const {
      festivalYearId,
      type,
      isPublished,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (festivalYearId) query.festivalYear = festivalYearId;
    if (type) query.type = type;
    if (isPublished !== undefined) query.isPublished = isPublished === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate("festivalYear", "year name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Video.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get videos",
    });
  }
};

// @desc    Get public videos
// @route   GET /api/videos/public
// @access  Public
exports.getPublicVideos = async (req, res) => {
  try {
    const { festivalYearId } = req.query;

    const query = { isPublished: true };
    if (festivalYearId) query.festivalYear = festivalYearId;

    const videos = await Video.find(query)
      .populate("festivalYear", "year name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("Get public videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public videos",
    });
  }
};

// @desc    Get videos by year
// @route   GET /api/videos/year/:yearId
// @access  Public
exports.getVideosByYear = async (req, res) => {
  try {
    const { yearId } = req.params;

    const videos = await Video.find({
      festivalYear: yearId,
      isPublished: true,
    })
      .populate("festivalYear", "year name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("Get videos by year error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get videos",
    });
  }
};

// @desc    Get video by ID
// @route   GET /api/videos/:id
// @access  Public
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id).populate(
      "festivalYear",
      "year name",
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Get video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video",
    });
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private/Admin
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const updatedVideo = await Video.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedVideo,
    });
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update video",
    });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private/Admin
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    await video.remove();

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete video",
    });
  }
};
