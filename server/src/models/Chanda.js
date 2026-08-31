const mongoose = require("mongoose");

const chandaSchema = new mongoose.Schema(
  {
    chandaId: {
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
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "QR Code"],
      default: "Cash",
    },
    upiTransactionId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    date: {
      type: Date,
      default: Date.now,
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

// Generate Chanda ID before saving
chandaSchema.pre("save", function (next) {
  if (!this.chandaId) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.chandaId = `CH-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Chanda", chandaSchema);
