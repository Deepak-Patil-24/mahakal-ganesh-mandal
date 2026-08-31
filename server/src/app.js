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
  // Cloudinary Storage
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
  // Local Storage (Fallback)
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

// ============== ADD UPI ROUTE HERE ==============
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

      // Get the URL based on storage type
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
// ... (keep all your existing photo routes)

// ============== VIDEO ROUTES ==============
// ... (keep all your existing video routes)

// ============== RAZORPAY DONATION ROUTES ==============
// ... (keep all your existing donation routes)

// ============== QR CODE DONATION ROUTES ==============
// ... (keep all your existing QR donation routes)

// ============== DONATION ROUTES ==============
// ... (keep all your existing donation routes)

// ============== CHANDA ROUTES ==============
// ... (keep all your existing chanda routes)

// ============== EXPENSE ROUTES ==============
// ... (keep all your existing expense routes)

// ============== VOLUNTEER ROUTES ==============
// ... (keep all your existing volunteer routes)

// ============== EVENT ROUTES ==============
// ... (keep all your existing event routes)

// ============== ANNOUNCEMENT ROUTES ==============
// ... (keep all your existing announcement routes)

// ============== QR CHANDA ROUTES ==============
// ... (keep all your existing QR chanda routes)

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
const User = require("./models/User");

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔄 Login attempt for email:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    console.log("📧 User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("🔑 Checking password...");
    const isMatch = await user.comparePassword(password);
    console.log("✅ Password match:", isMatch);

    if (!isMatch) {
      console.log("❌ Password does not match");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      console.log("❌ User is inactive");
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

    console.log("✅ Login successful for:", email);

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
    console.error("❌ Login error:", error);
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
  console.log("  ✅ UPI payment integration");
});
