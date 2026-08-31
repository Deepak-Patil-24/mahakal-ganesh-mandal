const Settings = require("../models/Settings");

// @desc    Get settings (admin)
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Create default settings
      settings = new Settings();
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get settings",
    });
  }
};

// @desc    Get public settings
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne().populate("festivalYear");

    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    // Return only public fields
    const publicSettings = {
      organizationName: settings.organizationName,
      tagline: settings.tagline,
      pandalAddress: settings.pandalAddress,
      googleMapsLocation: settings.googleMapsLocation,
      contactNumber: settings.contactNumber,
      socialMedia: settings.socialMedia,
      aartiTimings: settings.aartiTimings,
      festivalDates: settings.festivalDates,
      isLiveDarshanEnabled: settings.isLiveDarshanEnabled,
      liveDarshanUrl: settings.liveDarshanUrl,
      festivalYear: settings.festivalYear,
    };

    res.status(200).json({
      success: true,
      data: publicSettings,
    });
  } catch (error) {
    console.error("Get public settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public settings",
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Update settings
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        settings[key] = updates[key];
      }
    });

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};

// @desc    Upload logo
// @route   POST /api/settings/logo
// @access  Private/Admin
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a logo",
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.organizationLogo = req.file.path || req.file.url;
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Upload logo error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload logo",
    });
  }
};

// @desc    Upload QR code
// @route   POST /api/settings/qr-code
// @access  Private/Admin
exports.uploadQRCode = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a QR code",
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (!settings.upiSettings) {
      settings.upiSettings = {};
    }
    settings.upiSettings.qrCode = req.file.path || req.file.url;
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Upload QR code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload QR code",
    });
  }
};
