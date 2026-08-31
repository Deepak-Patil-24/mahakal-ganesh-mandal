const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    event: {
      type: String,
      default: "General",
    },
    views: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Photo", photoSchema);
