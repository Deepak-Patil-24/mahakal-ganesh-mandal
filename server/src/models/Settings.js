const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      default: "MAHAKAL GANESH MANDAL, KEB ROAD",
    },
    tagline: {
      type: String,
      default: "Ganpati Bappa Morya 🙏",
    },
    qrCodeUrl: {
      type: String,
      default: "",
    },
    upiId: {
      type: String,
      default: "",
    },
    contactNumber: {
      type: String,
      default: "+91 8431776329",
    },
    pandalAddress: {
      type: String,
      default: "KEB Road, [City]",
    },
    aartiTimings: {
      morning: { type: String, default: "6:00 AM" },
      evening: { type: String, default: "7:30 PM" },
    },
    socialMedia: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Settings", settingsSchema);
