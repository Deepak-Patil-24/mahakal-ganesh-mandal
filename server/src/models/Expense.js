const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    expenseId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Ganesh Idol",
        "Pandal",
        "Decoration",
        "Sound System",
        "Lighting",
        "Electricity",
        "Prasada/Food",
        "Cultural Programs",
        "Security",
        "Cleaning",
        "Transportation",
        "Immersion",
        "Other",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: "",
    },
    billUrl: {
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

// Generate Expense ID before saving
expenseSchema.pre("save", function (next) {
  if (!this.expenseId) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.expenseId = `EXP-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Expense", expenseSchema);
