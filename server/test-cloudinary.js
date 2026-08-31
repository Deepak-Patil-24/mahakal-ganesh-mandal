require("dotenv").config();
const cloudinary = require("./src/config/cloudinary");

async function testCloudinaryConnection() {
  console.log("\n🔄 Testing Cloudinary connection...\n");
  console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME || "❌ Not set");
  console.log(
    "API Key:",
    process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Not set",
  );
  console.log(
    "API Secret:",
    process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Not set",
  );

  try {
    // Test ping
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary ping successful:", result);

    // Test upload
    console.log("\n📤 Testing upload...");
    const uploadResult = await cloudinary.uploader.upload(
      "https://images.unsplash.com/photo-1580216643062-e6f7de10cf7b?w=100",
      {
        folder: "mahakal-ganesh/test",
        public_id: "test-image-" + Date.now(),
      },
    );
    console.log("✅ Test upload successful!");
    console.log("  URL:", uploadResult.secure_url);
    console.log("  Public ID:", uploadResult.public_id);

    // Delete test image
    console.log("\n🗑️ Cleaning up...");
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log("✅ Test cleanup complete");

    console.log("\n🎉 Cloudinary is working correctly!");
  } catch (error) {
    console.error("\n❌ Cloudinary error:", error.message);
    if (error.http_code) {
      console.error("  HTTP Code:", error.http_code);
    }
    if (error.error) {
      console.error("  Error details:", error.error);
    }
    console.log("\n💡 Troubleshooting:");
    console.log("1. Make sure your Cloudinary account is active");
    console.log(
      "2. Check if your Cloud Name is correct:",
      process.env.CLOUDINARY_CLOUD_NAME,
    );
    console.log("3. Check if your API Key is correct");
    console.log("4. Check if your API Secret is correct");
    console.log("5. Go to Cloudinary Dashboard to verify credentials");
    console.log("6. Try regenerating API keys in Cloudinary Dashboard");
  }
}

testCloudinaryConnection();
