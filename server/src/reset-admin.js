const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Delete existing admin if any
    await User.deleteOne({ email: "admin@mahakalganesh.com" });
    console.log("✅ Removed existing admin");

    // Create new admin with fresh password
    const admin = new User({
      name: "Super Admin",
      email: "admin@mahakalganesh.com",
      password: "Admin@123",
      role: "superadmin",
      isActive: true,
    });

    await admin.save();
    console.log("✅ New admin created successfully");
    console.log("📧 Email: admin@mahakalganesh.com");
    console.log("🔑 Password: Admin@123");

    // Verify the password was hashed correctly
    const savedUser = await User.findOne({
      email: "admin@mahakalganesh.com",
    }).select("+password");
    console.log(
      "🔐 Password hash:",
      savedUser.password.substring(0, 20) + "...",
    );

    // Test the password
    const testMatch = await bcrypt.compare("Admin@123", savedUser.password);
    console.log(
      "✅ Password verification test:",
      testMatch ? "PASSED ✅" : "FAILED ❌",
    );

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetAdmin();
