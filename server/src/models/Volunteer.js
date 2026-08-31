const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    area: {
      type: String,
      default: "General",
    },
    duty: {
      type: String,
      enum: [
        "Decoration",
        "Crowd Management",
        "Prasada",
        "Cleaning",
        "Security",
        "Cultural Programs",
        "General Assistance",
      ],
      default: "General Assistance",
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: "",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Generate Volunteer ID before saving
volunteerSchema.pre("save", function (next) {
  if (!this.volunteerId) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.volunteerId = `VOL-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Volunteer", volunteerSchema);
