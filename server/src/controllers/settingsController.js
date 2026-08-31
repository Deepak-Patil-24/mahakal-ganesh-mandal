const Settings = require("../models/Settings");

// @desc    Get settings (admin)
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
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
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    const publicSettings = {
      organizationName: settings.organizationName,
      tagline: settings.tagline,
      pandalAddress: settings.pandalAddress,
      contactNumber: settings.contactNumber,
      socialMedia: settings.socialMedia,
      aartiTimings: settings.aartiTimings,
      qrCodeUrl: settings.qrCodeUrl,
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName,
      upiDeepLink: settings.upiDeepLink,
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

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        settings[key] = updates[key];
      }
    });

    // Generate UPI deep link
    if (settings.upiId) {
      settings.upiDeepLink = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiPayeeName || "MAHAKAL GANESH MANDAL")}&cu=INR`;
    }

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

// @desc    Update UPI settings
// @route   PUT /api/settings/upi
// @access  Private/Admin
exports.updateUPISettings = async (req, res) => {
  try {
    const { upiId, upiPayeeName } = req.body;

    console.log("📝 updateUPISettings called with:", { upiId, upiPayeeName });

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (upiId !== undefined) settings.upiId = upiId;
    if (upiPayeeName !== undefined) settings.upiPayeeName = upiPayeeName;

    // Generate UPI deep link
    if (settings.upiId) {
      settings.upiDeepLink = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiPayeeName || "MAHAKAL GANESH MANDAL")}&cu=INR`;
    }

    await settings.save();

    console.log("✅ UPI settings saved:", {
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName,
      upiDeepLink: settings.upiDeepLink,
    });

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Update UPI settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update UPI settings",
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

    settings.qrCodeUrl = req.file.path || req.file.url;
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
