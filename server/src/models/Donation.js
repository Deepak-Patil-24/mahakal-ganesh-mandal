const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donationId: {
      type: String,
      unique: true,
    },
    donorName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "QR Code", "Card"],
      default: "UPI",
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    upiTransactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "FAILED"],
      default: "PENDING",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    verifiedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Generate donation ID before saving
donationSchema.pre("save", function (next) {
  if (!this.donationId) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.donationId = `DON-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Donation", donationSchema);
