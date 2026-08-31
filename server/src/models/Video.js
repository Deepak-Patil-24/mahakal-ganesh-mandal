const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    url: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    event: {
      type: String,
      default: "General",
      maxlength: [100, "Event name cannot be more than 100 characters"],
    },
    type: {
      type: String,
      enum: ["YOUTUBE", "SHORTS", "OTHER"],
      default: "YOUTUBE",
    },
    views: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: true,
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

// Generate thumbnail URL from video ID
videoSchema.virtual("thumbnailUrl").get(function () {
  if (this.videoId) {
    return `https://img.youtube.com/vi/${this.videoId}/mqdefault.jpg`;
  }
  return null;
});

// Index for faster queries
videoSchema.index({ year: -1 });
videoSchema.index({ views: -1 });
videoSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Video", videoSchema);
