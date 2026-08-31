const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Please provide event name"],
      trim: true,
      maxlength: [200, "Name cannot be more than 200 characters"],
    },
    date: {
      type: Date,
      required: [true, "Please provide event date"],
    },
    startTime: {
      type: String,
      required: [true, "Please provide start time"],
    },
    endTime: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    location: {
      type: String,
      maxlength: [200, "Location cannot be more than 200 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Aarti", "Puja", "Cultural", "Food", "Ceremony", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Generate event ID before saving
eventSchema.pre("save", function (next) {
  if (!this.eventId) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.eventId = `EVT-${year}-${random}`;
  }
  next();
});

// Auto-update status based on date
eventSchema.pre("save", function (next) {
  const now = new Date();
  const eventDate = new Date(this.date);
  const eventEndDate = new Date(this.date);
  eventEndDate.setHours(23, 59, 59);

  if (this.status === "CANCELLED") {
    return next();
  }

  if (now > eventEndDate) {
    this.status = "COMPLETED";
  } else if (now.toDateString() === eventDate.toDateString()) {
    this.status = "ONGOING";
  } else if (now < eventDate) {
    this.status = "UPCOMING";
  }

  next();
});

module.exports = mongoose.model("Event", eventSchema);
