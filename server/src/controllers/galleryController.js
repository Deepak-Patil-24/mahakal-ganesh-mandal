const GalleryAlbum = require("../models/GalleryAlbum");
const FestivalYear = require("../models/FestivalYear");

// @desc    Create album
// @route   POST /api/gallery
// @access  Private/Admin
exports.createAlbum = async (req, res) => {
  try {
    const { festivalYearId, name, description, event, isPublished } = req.body;

    // Validate required fields
    if (!festivalYearId || !name) {
      return res.status(400).json({
        success: false,
        message: "Please provide festival year and album name",
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

    const album = new GalleryAlbum({
      festivalYear: festivalYearId,
      name,
      description,
      event,
      isPublished: isPublished || true,
    });

    await album.save();

    res.status(201).json({
      success: true,
      data: album,
    });
  } catch (error) {
    console.error("Create album error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create album",
    });
  }
};

// @desc    Get all albums (admin)
// @route   GET /api/gallery
// @access  Private/Admin
exports.getAlbums = async (req, res) => {
  try {
    const { festivalYearId, isPublished, page = 1, limit = 20 } = req.query;

    const query = {};
    if (festivalYearId) query.festivalYear = festivalYearId;
    if (isPublished !== undefined) query.isPublished = isPublished === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [albums, total] = await Promise.all([
      GalleryAlbum.find(query)
        .populate("festivalYear", "year name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      GalleryAlbum.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: albums,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get albums error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get albums",
    });
  }
};

// @desc    Get public albums
// @route   GET /api/gallery/public
// @access  Public
exports.getPublicAlbums = async (req, res) => {
  try {
    const { festivalYearId } = req.query;

    const query = { isPublished: true };
    if (festivalYearId) query.festivalYear = festivalYearId;

    const albums = await GalleryAlbum.find(query)
      .populate("festivalYear", "year name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: albums,
    });
  } catch (error) {
    console.error("Get public albums error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public albums",
    });
  }
};

// @desc    Get album by ID
// @route   GET /api/gallery/:id
// @access  Public
exports.getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await GalleryAlbum.findById(id).populate(
      "festivalYear",
      "year name",
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    res.status(200).json({
      success: true,
      data: album,
    });
  } catch (error) {
    console.error("Get album error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get album",
    });
  }
};

// @desc    Get album photos
// @route   GET /api/gallery/public/:id/photos
// @access  Public
exports.getAlbumPhotos = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await GalleryAlbum.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    res.status(200).json({
      success: true,
      data: album.photos,
    });
  } catch (error) {
    console.error("Get album photos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get album photos",
    });
  }
};

// @desc    Update album
// @route   PUT /api/gallery/:id
// @access  Private/Admin
exports.updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const album = await GalleryAlbum.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    const updatedAlbum = await GalleryAlbum.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedAlbum,
    });
  } catch (error) {
    console.error("Update album error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update album",
    });
  }
};

// @desc    Delete album
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
exports.deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await GalleryAlbum.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    await album.remove();

    res.status(200).json({
      success: true,
      message: "Album deleted successfully",
    });
  } catch (error) {
    console.error("Delete album error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete album",
    });
  }
};

// @desc    Add photos to album
// @route   POST /api/gallery/:id/photos
// @access  Private/Admin
exports.addPhotos = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one photo",
      });
    }

    const album = await GalleryAlbum.findById(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    // Add photos
    const photos = req.files.map((file, index) => ({
      url: file.path || file.url,
      caption: req.body[`caption_${index}`] || "",
      order: album.photos.length + index,
    }));

    album.photos.push(...photos);

    // Set cover image if not set
    if (!album.coverImage && photos.length > 0) {
      album.coverImage = photos[0].url;
    }

    await album.save();

    res.status(200).json({
      success: true,
      data: album,
    });
  } catch (error) {
    console.error("Add photos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add photos",
    });
  }
};

// @desc    Delete photo
// @route   DELETE /api/gallery/:albumId/photos/:photoId
// @access  Private/Admin
exports.deletePhoto = async (req, res) => {
  try {
    const { albumId, photoId } = req.params;

    const album = await GalleryAlbum.findById(albumId);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    // Remove photo
    album.photos = album.photos.filter(
      (photo) => photo._id.toString() !== photoId,
    );

    // Update cover image if needed
    if (album.coverImage && album.photos.length > 0) {
      album.coverImage = album.photos[0].url;
    } else if (album.photos.length === 0) {
      album.coverImage = "";
    }

    await album.save();

    res.status(200).json({
      success: true,
      data: album,
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete photo",
    });
  }
};
