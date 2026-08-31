const mongoose = require("mongoose");

const festivalYearSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: [true, "Please provide a year"],
      unique: true,
      validate: {
        validator: function (v) {
          return v >= 2020 && v <= 2100;
        },
        message: "Year must be between 2020 and 2100",
      },
    },
    name: {
      type: String,
      required: true,
      default: function () {
        return `Ganesh Utsav ${this.year}`;
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      maxlength: [200, "Theme cannot be more than 200 characters"],
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    donorCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Calculate balance before saving
festivalYearSchema.pre("save", function (next) {
  this.balance = this.totalDonations - this.totalExpenses;
  next();
});

// Index for faster queries
festivalYearSchema.index({ year: -1 });
festivalYearSchema.index({ isActive: 1 });

module.exports = mongoose.model("FestivalYear", festivalYearSchema);
