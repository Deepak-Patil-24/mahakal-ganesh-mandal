const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    festivalYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FestivalYear",
      required: true,
    },
    type: {
      type: String,
      enum: ["LOST", "FOUND"],
      required: true,
    },
    itemName: {
      type: String,
      required: [true, "Please provide item name"],
      trim: true,
      maxlength: [100, "Item name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      maxlength: [200, "Location cannot be more than 200 characters"],
    },
    contact: {
      type: String,
      maxlength: [100, "Contact cannot be more than 100 characters"],
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },
    resolvedAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
  },
);

lostFoundSchema.index({ festivalYear: 1, type: 1, status: 1 });

module.exports = mongoose.model("LostFound", lostFoundSchema);
