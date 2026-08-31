const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    announcementId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide content"],
      maxlength: [2000, "Content cannot be more than 2000 characters"],
    },
    type: {
      type: String,
      enum: [
        "General",
        "Emergency",
        "Event Update",
        "Schedule Change",
        "Urgent",
      ],
      default: "General",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
    image: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Generate announcement ID before saving
announcementSchema.pre("save", function (next) {
  if (!this.announcementId) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.announcementId = `ANN-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Announcement", announcementSchema);
