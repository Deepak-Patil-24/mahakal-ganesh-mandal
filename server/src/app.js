const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();

// Import Models
const Donation = require("./models/Donation");
const Settings = require("./models/Settings");
const Photo = require("./models/Photo");
const Video = require("./models/Video");
const Chanda = require("./models/Chanda");
const Expense = require("./models/Expense");
const Volunteer = require("./models/Volunteer");
const Event = require("./models/Event");
const Announcement = require("./models/Announcement");
const User = require("./models/User");

// Import Cloudinary Config
const cloudinary = require("./config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
    console.log("📊 Database:", mongoose.connection.name);
  })
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ============== CLOUDINARY MULTER SETUP ==============

// Check if Cloudinary is configured
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

console.log(
  `📁 Cloudinary: ${isCloudinaryConfigured ? "✅ Configured" : "❌ Not configured"}`,
);

// Configure storage based on Cloudinary availability
let storage;
let upload;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "mahakal-ganesh/images",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ width: 2000, height: 2000, crop: "limit" }],
    },
  });

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const mimetype = allowedTypes.test(file.mimetype);
      if (mimetype) {
        return cb(null, true);
      }
      cb(new Error("Only images are allowed"));
    },
  });

  console.log("📁 Using Cloudinary storage");
} else {
  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = "uploads/";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
      );
    },
  });

  upload = multer({
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase(),
      );
      const mimetype = allowedTypes.test(file.mimetype);
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error("Only images are allowed"));
    },
  });

  console.log("📁 Using Local storage (fallback)");
}

// ============== HEALTH CHECK ==============
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ============== SETTINGS ROUTES ==============

// Get public settings
app.get("/api/settings/public", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json({
      success: true,
      data: {
        organizationName: settings.organizationName,
        tagline: settings.tagline,
        qrCodeUrl: settings.qrCodeUrl,
        upiId: settings.upiId,
        contactNumber: settings.contactNumber,
        pandalAddress: settings.pandalAddress,
        aartiTimings: settings.aartiTimings,
        socialMedia: settings.socialMedia,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get settings",
    });
  }
});

// Get all settings (Admin)
app.get("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get settings",
    });
  }
});

// Update settings (Admin)
app.put("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
});

// ============== UPI ROUTE ==============
// Update UPI settings (Admin)
app.put("/api/settings/upi", async (req, res) => {
  try {
    const { upiId, upiPayeeName } = req.body;

    console.log("📝 updateUPISettings called with:", { upiId, upiPayeeName });

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (upiId !== undefined) settings.upiId = upiId;
    if (upiPayeeName !== undefined) settings.upiPayeeName = upiPayeeName;

    if (settings.upiId) {
      settings.upiDeepLink = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiPayeeName || "Jai Mahakal Ganesh MANDAL")}&cu=INR`;
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
});

// Upload QR Code (Admin)
app.post(
  "/api/settings/upload-qr",
  upload.single("qrCode"),
  async (req, res) => {
    try {
      console.log("📤 QR Upload request received");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      console.log("✅ File received:", req.file);

      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings();
      }

      let imageUrl;
      if (req.file.path) {
        imageUrl = req.file.path;
      } else if (req.file.secure_url) {
        imageUrl = req.file.secure_url;
      } else if (req.file.url) {
        imageUrl = req.file.url;
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      console.log("📸 Image URL:", imageUrl);

      settings.qrCodeUrl = imageUrl;
      await settings.save();

      res.json({
        success: true,
        data: settings,
        message: "QR Code uploaded successfully!",
      });
    } catch (error) {
      console.error("❌ Upload QR error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload QR code",
      });
    }
  },
);

// ============== PHOTO ROUTES ==============

// Upload photos (Admin)
app.post("/api/photos/upload", upload.array("photos", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const { title, caption, year, event } = req.body;
    const photos = [];

    for (const file of req.files) {
      let imageUrl;
      if (file.path) {
        imageUrl = file.path;
      } else if (file.secure_url) {
        imageUrl = file.secure_url;
      } else if (file.url) {
        imageUrl = file.url;
      } else {
        imageUrl = `/uploads/${file.filename}`;
      }

      const photo = new Photo({
        title: title || "Ganesh Utsav",
        url: imageUrl,
        publicId: file.filename || file.public_id,
        caption: caption || "",
        year: year || new Date().getFullYear(),
        event: event || "General",
        views: 0,
      });
      await photo.save();
      photos.push(photo);
    }

    res.json({
      success: true,
      data: photos,
      message: `${photos.length} photos uploaded successfully!`,
    });
  } catch (error) {
    console.error("Upload photos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload photos",
    });
  }
});

// Get all photos (Public)
app.get("/api/photos", async (req, res) => {
  try {
    const { year, event } = req.query;
    const query = {};
    if (year) query.year = parseInt(year);
    if (event) query.event = event;

    const photos = await Photo.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: photos });
  } catch (error) {
    console.error("Get photos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get photos",
    });
  }
});

// Get photo with view count increment (Public)
app.get("/api/photos/:id/view", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }
    photo.views = (photo.views || 0) + 1;
    await photo.save();
    res.json({ success: true, data: photo });
  } catch (error) {
    console.error("Get photo view error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get photo",
    });
  }
});

// Delete photo (Admin)
app.delete("/api/photos/:id", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }
    if (isCloudinaryConfigured && photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
      }
    }
    await photo.deleteOne();
    res.json({ success: true, message: "Photo deleted" });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete photo",
    });
  }
});

// Get photo statistics (Admin)
app.get("/api/photos/stats", async (req, res) => {
  try {
    const totalPhotos = await Photo.countDocuments();
    const totalViews = await Photo.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const mostViewed = await Photo.find().sort({ views: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalPhotos,
        totalViews: totalViews[0]?.total || 0,
        mostViewed,
      },
    });
  } catch (error) {
    console.error("Get photo stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get photo statistics",
    });
  }
});

// ============== VIDEO ROUTES ==============

// Add video (Admin)
app.post("/api/videos", async (req, res) => {
  try {
    const { title, url, description, year, event, type } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: "Title and URL are required",
      });
    }

    let videoId = url;
    const youtubeRegex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(youtubeRegex);
    if (match) {
      videoId = match[1];
    }

    const video = new Video({
      title,
      url,
      videoId,
      description: description || "",
      year: year || new Date().getFullYear(),
      event: event || "General",
      type: type || "YOUTUBE",
      views: 0,
    });

    await video.save();
    res.json({
      success: true,
      data: video,
      message: "Video added successfully!",
    });
  } catch (error) {
    console.error("Add video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add video",
    });
  }
});

// Get all videos (Public)
app.get("/api/videos", async (req, res) => {
  try {
    const { year } = req.query;
    const query = {};
    if (year) query.year = parseInt(year);

    const videos = await Video.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get videos",
    });
  }
});

// Get single video with view count increment (Public)
app.get("/api/videos/:id/view", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
    video.views = (video.views || 0) + 1;
    await video.save();
    res.json({ success: true, data: video });
  } catch (error) {
    console.error("Get video view error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video",
    });
  }
});

// Get single video by ID (Public)
app.get("/api/videos/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
    res.json({ success: true, data: video });
  } catch (error) {
    console.error("Get video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video",
    });
  }
});

// Get videos by year (Public)
app.get("/api/videos/year/:year", async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const videos = await Video.find({ year }).sort({ createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    console.error("Get videos by year error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get videos",
    });
  }
});

// Get featured videos (Public)
app.get("/api/videos/featured", async (req, res) => {
  try {
    const videos = await Video.find().sort({ views: -1 }).limit(5);
    res.json({ success: true, data: videos });
  } catch (error) {
    console.error("Get featured videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get featured videos",
    });
  }
});

// Update video (Admin)
app.put("/api/videos/:id", async (req, res) => {
  try {
    const { title, url, description, year, event, type } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    let videoId = video.videoId;
    if (url && url !== video.url) {
      const youtubeRegex =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      const match = url.match(youtubeRegex);
      if (match) {
        videoId = match[1];
      }
    }

    video.title = title || video.title;
    video.url = url || video.url;
    video.videoId = videoId;
    video.description = description || video.description;
    video.year = year || video.year;
    video.event = event || video.event;
    video.type = type || video.type;

    await video.save();

    res.json({
      success: true,
      data: video,
      message: "Video updated successfully!",
    });
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update video",
    });
  }
});

// Delete video (Admin)
app.delete("/api/videos/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
    await video.deleteOne();
    res.json({
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
});

// Bulk delete videos (Admin)
app.delete("/api/videos/bulk", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of video IDs",
      });
    }
    await Video.deleteMany({ _id: { $in: ids } });
    res.json({
      success: true,
      message: `${ids.length} videos deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk delete videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete videos",
    });
  }
});

// Get video statistics (Admin)
app.get("/api/videos/stats", async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    const totalViews = await Video.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const mostViewed = await Video.find().sort({ views: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalVideos,
        totalViews: totalViews[0]?.total || 0,
        mostViewed,
      },
    });
  } catch (error) {
    console.error("Get video stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video statistics",
    });
  }
});

// ============== RAZORPAY DONATION ROUTES ==============

// Create Razorpay Order
app.post("/api/donations/create-order", async (req, res) => {
  try {
    const { name, phone, amount, paymentMethod, isAnonymous } = req.body;

    if (!name || !amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Name and valid amount are required",
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        donorName: name,
        phone: phone || "N/A",
      },
    };

    const order = await razorpay.orders.create(options);

    const donation = new Donation({
      donorName: name,
      phone: phone || "",
      amount: amount,
      paymentMethod: paymentMethod || "UPI",
      orderId: order.id,
      status: "PENDING",
      isAnonymous: isAnonymous || false,
    });

    await donation.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        donationId: donation._id,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
});

// Verify Payment
app.post("/api/donations/verify", async (req, res) => {
  try {
    const { donationId, paymentId, orderId, signature } = req.body;

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    donation.status = "VERIFIED";
    donation.paymentId = paymentId;
    donation.verifiedAt = new Date();

    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    donation.receiptNumber = `REC-${year}-${random}`;

    await donation.save();

    res.json({
      success: true,
      data: donation,
      message: "Payment verified successfully! 🙏",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
});

// ============== QR CODE DONATION ROUTES ==============

// Create QR donation
app.post("/api/donations/create-qr", async (req, res) => {
  try {
    const { name, phone, amount, isAnonymous } = req.body;

    if (!name || !amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Name and valid amount are required",
      });
    }

    const donation = new Donation({
      donorName: name,
      phone: phone || "",
      amount: amount,
      paymentMethod: "QR Code",
      status: "PENDING",
      isAnonymous: isAnonymous || false,
    });

    await donation.save();

    res.json({
      success: true,
      data: donation,
      message: "QR donation created. Please scan and pay.",
    });
  } catch (error) {
    console.error("Create QR donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create QR donation",
    });
  }
});

// Verify QR donation
app.post("/api/donations/verify-qr", async (req, res) => {
  try {
    const { donationId, upiTransactionId } = req.body;

    if (!donationId || !upiTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Donation ID and UPI transaction ID are required",
      });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    donation.upiTransactionId = upiTransactionId;
    donation.status = "VERIFIED";
    donation.verifiedAt = new Date();

    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    donation.receiptNumber = `REC-${year}-${random}`;

    await donation.save();

    res.json({
      success: true,
      data: donation,
      message: "QR donation verified successfully!",
    });
  } catch (error) {
    console.error("Verify QR donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify QR donation",
    });
  }
});

// ============== DONATION ROUTES ==============

// Get all verified donations (Public) - ONLY SHOW VERIFIED
app.get("/api/donations/public", async (req, res) => {
  try {
    const donations = await Donation.find({
      status: "VERIFIED",
    })
      .select("donorName amount paymentMethod createdAt isAnonymous")
      .sort({ createdAt: -1 });

    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

    res.json({
      success: true,
      data: donations,
      totals: {
        totalDonations,
        donorCount: donations.length,
      },
    });
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get donations",
    });
  }
});

// Get all donations (Admin)
app.get("/api/donations", async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get donations",
    });
  }
});

// Verify donation (Admin)
app.put("/api/donations/:id/verify", async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    donation.status = "VERIFIED";
    donation.verifiedAt = new Date();

    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    donation.receiptNumber = `REC-${year}-${random}`;

    await donation.save();
    res.json({ success: true, data: donation });
  } catch (error) {
    console.error("Verify donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify donation",
    });
  }
});

// Delete donation (Admin)
app.delete("/api/donations/:id", async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Donation deleted" });
  } catch (error) {
    console.error("Delete donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete donation",
    });
  }
});

// ============== CHANDA ROUTES ==============

// Add Chanda (Admin)
app.post("/api/chanda", async (req, res) => {
  try {
    const { name, phone, amount, paymentMethod, notes } = req.body;

    if (!name || !phone || !amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Name, phone and valid amount are required",
      });
    }

    const chanda = new Chanda({
      name: name.trim(),
      phone: phone.trim(),
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || "Cash",
      notes: notes || "",
    });

    await chanda.save();

    res.json({
      success: true,
      data: chanda,
      message: "Chanda added successfully! 🙏",
    });
  } catch (error) {
    console.error("Add Chanda error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add Chanda",
    });
  }
});

// Get all Chanda (Admin)
app.get("/api/chanda", async (req, res) => {
  try {
    const chandaList = await Chanda.find().sort({ createdAt: -1 });
    const totalAmount = chandaList.reduce((sum, c) => sum + c.amount, 0);

    res.json({
      success: true,
      data: chandaList,
      total: totalAmount,
      count: chandaList.length,
    });
  } catch (error) {
    console.error("Get Chanda error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get Chanda",
    });
  }
});

// Get Chanda summary (Public)
app.get("/api/chanda/public", async (req, res) => {
  try {
    const chandaList = await Chanda.find().sort({ createdAt: -1 });
    const totalAmount = chandaList.reduce((sum, c) => sum + c.amount, 0);

    res.json({
      success: true,
      data: chandaList.slice(0, 50),
      total: totalAmount,
      count: chandaList.length,
    });
  } catch (error) {
    console.error("Get public Chanda error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get Chanda",
    });
  }
});

// Delete Chanda (Admin)
app.delete("/api/chanda/:id", async (req, res) => {
  try {
    await Chanda.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Chanda deleted" });
  } catch (error) {
    console.error("Delete Chanda error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete Chanda",
    });
  }
});

// ============== EXPENSE ROUTES ==============

// Add Expense (Admin)
app.post("/api/expenses", async (req, res) => {
  try {
    const { name, category, amount, date, description } = req.body;

    if (!name || !category || !amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Name, category and valid amount are required",
      });
    }

    const expense = new Expense({
      name: name.trim(),
      category,
      amount: parseFloat(amount),
      date: date || new Date(),
      description: description || "",
    });

    await expense.save();

    res.json({
      success: true,
      data: expense,
      message: "Expense added successfully!",
    });
  } catch (error) {
    console.error("Add Expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add expense",
    });
  }
});

// Get all Expenses (Admin)
app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      success: true,
      data: expenses,
      total: totalAmount,
      count: expenses.length,
    });
  } catch (error) {
    console.error("Get Expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get expenses",
    });
  }
});

// Get Expenses (Public)
app.get("/api/expenses/public", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 }).limit(50);
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      success: true,
      data: expenses,
      total: totalAmount,
    });
  } catch (error) {
    console.error("Get public expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get expenses",
    });
  }
});

// Delete Expense (Admin)
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    console.error("Delete Expense error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
    });
  }
});

// ============== VOLUNTEER ROUTES ==============

// Get all volunteers (Public)
app.get("/api/volunteers", async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: volunteers });
  } catch (error) {
    console.error("Get volunteers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get volunteers",
    });
  }
});

// Get all volunteers (Admin)
app.get("/api/volunteers/admin", async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json({ success: true, data: volunteers });
  } catch (error) {
    console.error("Get volunteers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get volunteers",
    });
  }
});

// Add volunteer (Admin)
app.post("/api/volunteers", upload.single("image"), async (req, res) => {
  try {
    const { name, phone, email, area, duty, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl =
        req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    } else {
      imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E87516&color=fff&size=200`;
    }

    const volunteer = new Volunteer({
      name: name.trim(),
      phone: phone.trim(),
      email: email || "",
      area: area || "General",
      duty: duty || "General Assistance",
      image: imageUrl,
      notes: notes || "",
      isActive: true,
    });

    await volunteer.save();

    res.json({
      success: true,
      data: volunteer,
      message: "Volunteer added successfully!",
    });
  } catch (error) {
    console.error("Add volunteer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add volunteer",
    });
  }
});

// Update volunteer (Admin)
app.put("/api/volunteers/:id", upload.single("image"), async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    const { name, phone, email, area, duty, notes, isActive } = req.body;

    volunteer.name = name || volunteer.name;
    volunteer.phone = phone || volunteer.phone;
    volunteer.email = email || volunteer.email;
    volunteer.area = area || volunteer.area;
    volunteer.duty = duty || volunteer.duty;
    volunteer.notes = notes || volunteer.notes;
    volunteer.isActive = isActive !== undefined ? isActive : volunteer.isActive;

    if (req.file) {
      volunteer.image =
        req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    }

    await volunteer.save();

    res.json({
      success: true,
      data: volunteer,
      message: "Volunteer updated successfully!",
    });
  } catch (error) {
    console.error("Update volunteer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update volunteer",
    });
  }
});

// Delete volunteer (Admin)
app.delete("/api/volunteers/:id", async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Volunteer deleted" });
  } catch (error) {
    console.error("Delete volunteer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete volunteer",
    });
  }
});

// Update volunteer status (Admin)
app.put("/api/volunteers/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    volunteer.isActive = isActive;
    await volunteer.save();

    res.json({
      success: true,
      data: volunteer,
      message: `Volunteer ${isActive ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    console.error("Update volunteer status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update volunteer status",
    });
  }
});

// ============== EVENT ROUTES ==============

// Get all events (Public)
app.get("/api/events", async (req, res) => {
  try {
    const { status, type, upcoming } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    if (upcoming === "true") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { $gte: today };
    }

    const events = await Event.find(query)
      .sort({ date: 1, startTime: 1 })
      .limit(50);

    res.json({ success: true, data: events });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get events",
    });
  }
});

// Get upcoming events (Public)
app.get("/api/events/upcoming", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.find({
      date: { $gte: today },
      status: { $ne: "CANCELLED" },
    })
      .sort({ date: 1, startTime: 1 })
      .limit(10);

    res.json({ success: true, data: events });
  } catch (error) {
    console.error("Get upcoming events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get upcoming events",
    });
  }
});

// Get single event (Public)
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get event",
    });
  }
});

// Create event (Admin)
app.post("/api/events", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      date,
      startTime,
      endTime,
      description,
      location,
      type,
      status,
      isFeatured,
    } = req.body;

    if (!name || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Name, date and start time are required",
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl =
        req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    }

    const event = new Event({
      name: name.trim(),
      date: new Date(date),
      startTime,
      endTime: endTime || "",
      description: description || "",
      location: location || "",
      type: type || "Other",
      image: imageUrl,
      status: status || "UPCOMING",
      isFeatured: isFeatured === "true" || false,
    });

    await event.save();

    res.json({
      success: true,
      data: event,
      message: "Event created successfully!",
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
});

// Update event (Admin)
app.put("/api/events/:id", upload.single("image"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const {
      name,
      date,
      startTime,
      endTime,
      description,
      location,
      type,
      status,
      isFeatured,
    } = req.body;

    event.name = name || event.name;
    event.date = date ? new Date(date) : event.date;
    event.startTime = startTime || event.startTime;
    event.endTime = endTime || event.endTime;
    event.description = description || event.description;
    event.location = location || event.location;
    event.type = type || event.type;
    event.status = status || event.status;
    event.isFeatured = isFeatured !== undefined ? isFeatured : event.isFeatured;

    if (req.file) {
      event.image =
        req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    }

    await event.save();

    res.json({
      success: true,
      data: event,
      message: "Event updated successfully!",
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
});

// Delete event (Admin)
app.delete("/api/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
});

// Update event status (Admin)
app.put("/api/events/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.status = status;
    await event.save();

    res.json({
      success: true,
      data: event,
      message: `Event status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update event status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event status",
    });
  }
});

// ============== ANNOUNCEMENT ROUTES ==============

// Get all announcements (Public)
app.get("/api/announcements/public", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const announcements = await Announcement.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Get public announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get announcements",
    });
  }
});

// Get featured announcements (Public)
app.get("/api/announcements/featured", async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isPublished: true,
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Get featured announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get featured announcements",
    });
  }
});

// Get all announcements (Admin)
app.get("/api/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get announcements",
    });
  }
});

// Get single announcement (Public)
app.get("/api/announcements/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    announcement.views += 1;
    await announcement.save();

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get announcement",
    });
  }
});

// Create announcement (Admin)
app.post("/api/announcements", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      isPublished,
      isFeatured,
      expiresAt,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl =
        req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    }

    const announcement = new Announcement({
      title: title.trim(),
      content: content.trim(),
      type: type || "General",
      priority: priority || "Medium",
      isPublished: isPublished !== undefined ? isPublished : true,
      isFeatured: isFeatured || false,
      expiresAt: expiresAt || null,
      image: imageUrl,
    });

    await announcement.save();

    res.json({
      success: true,
      data: announcement,
      message: "Announcement created successfully!",
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
});

// Update announcement (Admin)
app.put("/api/announcements/:id", upload.single("image"), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const {
      title,
      content,
      type,
      priority,
      isPublished,
      isFeatured,
      expiresAt,
    } = req.body;

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.type = type || announcement.type;
    announcement.priority = priority || announcement.priority;
    announcement.isPublished =
      isPublished !== undefined ? isPublished : announcement.isPublished;
    announcement.isFeatured =
      isFeatured !== undefined ? isFeatured : announcement.isFeatured;
    announcement.expiresAt = expiresAt || announcement.expiresAt;

    if (req.file) {
      announcement.image =
        req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    }

    await announcement.save();

    res.json({
      success: true,
      data: announcement,
      message: "Announcement updated successfully!",
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
});

// Delete announcement (Admin)
app.delete("/api/announcements/:id", async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
});

// Toggle publish status (Admin)
app.put("/api/announcements/:id/toggle-publish", async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    announcement.isPublished = !announcement.isPublished;
    await announcement.save();

    res.json({
      success: true,
      data: announcement,
      message: `Announcement ${announcement.isPublished ? "published" : "unpublished"}`,
    });
  } catch (error) {
    console.error("Toggle publish error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle publish status",
    });
  }
});

// ============== QR CHANDA ROUTES ==============

// Create QR Chanda (Public)
app.post("/api/chanda/qr", async (req, res) => {
  try {
    const { name, phone, amount, paymentMethod, upiTransactionId } = req.body;

    if (!name || !phone || !amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Name, phone and valid amount are required",
      });
    }

    if (!upiTransactionId || upiTransactionId.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "UPI Transaction ID is required for QR payments",
      });
    }

    const existingChanda = await Chanda.findOne({
      upiTransactionId: upiTransactionId.trim(),
    });
    if (existingChanda) {
      return res.status(400).json({
        success: false,
        message: "This transaction ID has already been used",
      });
    }

    const chanda = new Chanda({
      name: name.trim(),
      phone: phone.trim(),
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || "QR Code",
      upiTransactionId: upiTransactionId.trim(),
      status: "PENDING",
      notes: `QR Payment - Transaction ID: ${upiTransactionId.trim()} - Pending Verification`,
    });

    await chanda.save();

    res.json({
      success: true,
      data: {
        _id: chanda._id,
        chandaId: chanda.chandaId,
        name: chanda.name,
        phone: chanda.phone,
        amount: chanda.amount,
        paymentMethod: chanda.paymentMethod,
        upiTransactionId: chanda.upiTransactionId,
        status: chanda.status,
        createdAt: chanda.createdAt,
      },
      message: "Chanda recorded! Admin will verify your payment. 🙏",
    });
  } catch (error) {
    console.error("QR Chanda error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process QR Chanda",
    });
  }
});

// Verify QR Chanda (Admin)
app.put("/api/chanda/:id/verify", async (req, res) => {
  try {
    const { upiTransactionId } = req.body;
    const chanda = await Chanda.findById(req.params.id);

    if (!chanda) {
      return res.status(404).json({
        success: false,
        message: "Chanda entry not found",
      });
    }

    if (chanda.status === "VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "This Chanda is already verified",
      });
    }

    if (!chanda.upiTransactionId) {
      return res.status(400).json({
        success: false,
        message: "No transaction ID found for this payment",
      });
    }

    chanda.status = "VERIFIED";
    chanda.notes = `Verified by admin. UPI Transaction: ${chanda.upiTransactionId}`;
    await chanda.save();

    res.json({
      success: true,
      data: chanda,
      message: "Chanda verified successfully! ✅",
    });
  } catch (error) {
    console.error("Verify Chanda error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify Chanda",
    });
  }
});

// ============== FESTIVAL YEAR ROUTES ==============

app.get("/api/festival-years/active", (req, res) => {
  res.json({
    success: true,
    data: {
      year: 2026,
      name: "Ganesh Utsav 2026",
      isActive: true,
      startDate: "2026-09-01",
      endDate: "2026-09-11",
    },
  });
});

// ============== AUTH ROUTES ==============
const jwt = require("jsonwebtoken");

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

app.get("/api/auth/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(401).json({
      success: false,
      message:
        error.name === "JsonWebTokenError" ? "Invalid token" : "Token expired",
    });
  }
});

// ============== 404 HANDLER ==============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============== ERROR HANDLER ==============
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ============== START SERVER ==============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log("\n📋 Features:");
  console.log("  ✅ Cloudinary image upload (if configured)");
  console.log("  ✅ QR Code upload by admin");
  console.log("  ✅ Gallery photos in cloud");
  console.log("  ✅ YouTube videos support");
  console.log("  ✅ Razorpay payment");
  console.log("  ✅ Chanda management");
  console.log("  ✅ Expense management");
});
