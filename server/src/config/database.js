const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Create default admin after connection
    await createDefaultAdmin();

    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const User = require("../models/User");

    // Check if admin exists
    const adminExists = await User.findOne({
      email: process.env.ADMIN_EMAIL || "admin@mahakalganesh.com",
    });

    if (adminExists) {
      console.log("✅ Admin user already exists");
      console.log("📧 Email:", adminExists.email);
      return;
    }

    // Create new admin
    const admin = new User({
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL || "admin@mahakalganesh.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: "superadmin",
      isActive: true,
    });

    await admin.save();
    console.log("✅ Default admin created successfully");
    console.log(
      "📧 Email:",
      process.env.ADMIN_EMAIL || "admin@mahakalganesh.com",
    );
    console.log("🔑 Password:", process.env.ADMIN_PASSWORD || "Admin@123");
    console.log("⚠️  Please change the default password after first login!");
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
};

module.exports = connectDB;
