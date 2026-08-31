const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log configuration (without exposing secret)
console.log("📁 Cloudinary Config:");
console.log(
  "  Cloud Name:",
  process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing",
);
console.log(
  "  API Key:",
  process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
);
console.log(
  "  API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
);

// Test function
const testCloudinary = async () => {
  try {
    // Try to ping Cloudinary
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connected successfully:", result);
    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection error:", error.message);
    return false;
  }
};

// Run test immediately
testCloudinary();

module.exports = cloudinary;
