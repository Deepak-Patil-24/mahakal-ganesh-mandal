import React, { useState, useEffect } from "react";
import {
  FaDonate,
  FaUser,
  FaPhone,
  FaMoneyBill,
  FaWallet,
  FaQrcode,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaHands,
  FaChartBar,
  FaFileInvoice,
  FaHeart,
  FaEnvelope,
  FaPhoneAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Donate.css";

const Donate = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    paymentMethod: "QR Code",
    isAnonymous: false,
  });
  const [showQR, setShowQR] = useState(false);
  const [qrDonation, setQrDonation] = useState(null);
  const [settings, setSettings] = useState({ qrCodeUrl: "", upiId: "" });

  useEffect(() => {
    fetchSettings();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings/public");
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQRPayment = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || parseFloat(formData.amount) < 1) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/donations/create-qr", {
        name: formData.name,
        phone: formData.phone || "",
        amount: parseFloat(formData.amount),
        isAnonymous: formData.isAnonymous,
      });

      if (response.data.success) {
        setQrDonation(response.data.data);
        setShowQR(true);
        toast.info("Please scan the QR code to complete payment");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create donation");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();

    toast.info(
      "UPI payment is currently under development. Please use QR Code for now.",
    );
    return;
  };

  const handleSubmit = (e) => {
    if (formData.paymentMethod === "QR Code") {
      handleQRPayment(e);
    } else {
      handleRazorpayPayment(e);
    }
  };

  const handleQRSubmit = async (e) => {
    e.preventDefault();
    const upiId = e.target.upiId.value;
    if (!upiId || upiId.length < 3) {
      toast.error("Please enter a valid UPI transaction ID");
      return;
    }

    setLoading(true);
    try {
      await api.post("/donations/verify-qr", {
        donationId: qrDonation._id,
        upiTransactionId: upiId,
      });
      toast.success("QR payment recorded! Admin will verify it shortly.");
      setShowQR(false);
      setFormData({
        name: "",
        phone: "",
        amount: "",
        paymentMethod: "QR Code",
        isAnonymous: false,
      });
      setTimeout(() => {
        window.location.href = "/transparency";
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-page">
      <div className="container">
        <div className="donate-header">
          <h1 className="section-title">
            <FaHands className="title-icon" /> Donate Now
          </h1>
          <p className="section-subtitle">Support Jai Mahakal Ganesh Mandal</p>
        </div>

        <div className="donate-wrapper">
          <div className="donate-container">
            {/* Development Notice */}
            <div className="dev-notice">
              <FaClock className="dev-icon" />
              <div className="dev-content">
                <h4>
                  <FaInfoCircle /> UPI Payment Under Development
                </h4>
                <p>
                  For now, please use the <strong>QR Code</strong> option to
                  make your donation. UPI payment will be available soon.
                </p>
              </div>
            </div>

            {!showQR ? (
              <form onSubmit={handleSubmit} className="donate-form">
                <div className="form-group">
                  <label>
                    <FaUser className="input-icon" /> Full Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaPhone className="input-icon" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaMoneyBill className="input-icon" /> Amount (₹){" "}
                    <span>*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Payment Method <span>*</span>
                  </label>
                  <div className="payment-options">
                    <label
                      className={`payment-option ${formData.paymentMethod === "QR Code" ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="QR Code"
                        checked={formData.paymentMethod === "QR Code"}
                        onChange={handleChange}
                      />
                      <FaQrcode /> QR Code{" "}
                      <span className="recommended-badge">Recommended</span>
                    </label>
                    <label
                      className={`payment-option ${formData.paymentMethod === "UPI" ? "active" : ""} disabled`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={formData.paymentMethod === "UPI"}
                        onChange={handleChange}
                        disabled
                      />
                      <FaWallet /> UPI{" "}
                      <span className="coming-soon-badge">Soon</span>
                    </label>
                    <label
                      className={`payment-option ${formData.paymentMethod === "Cash" ? "active" : ""} disabled`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash"
                        checked={formData.paymentMethod === "Cash"}
                        onChange={handleChange}
                        disabled
                      />
                      <FaMoneyBill /> Cash{" "}
                      <span className="coming-soon-badge">Soon</span>
                    </label>
                  </div>
                  <small className="payment-note">
                    <FaExclamationTriangle /> UPI and Cash options are currently
                    under development. Please use QR Code for donations.
                  </small>
                </div>

                <div className="form-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={handleChange}
                    />
                    <span>Donate Anonymously</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-primary donate-submit"
                  disabled={loading}
                >
                  <FaDonate /> {loading ? "Processing..." : "Generate QR Code"}
                </button>
              </form>
            ) : (
              <div className="qr-section">
                <div className="qr-header">
                  <FaQrcode className="qr-icon" />
                  <h2>Scan to Donate</h2>
                  <p>Use any UPI app to scan this QR code</p>
                </div>

                <div className="qr-steps">
                  <div className="step">
                    <span className="step-number">1</span>
                    <span>Scan QR code</span>
                  </div>
                  <div className="step">
                    <span className="step-number">2</span>
                    <span>Make payment</span>
                  </div>
                  <div className="step">
                    <span className="step-number">3</span>
                    <span>Enter transaction ID</span>
                  </div>
                </div>

                <div className="qr-container">
                  {settings.qrCodeUrl ? (
                    <img
                      src={settings.qrCodeUrl}
                      alt="Donation QR Code"
                      className="qr-image"
                    />
                  ) : (
                    <div className="qr-placeholder">
                      <FaQrcode size={64} />
                      <p>No QR Code configured</p>
                      <small>Please contact admin</small>
                    </div>
                  )}
                </div>

                <div className="qr-details">
                  <div className="qr-detail-item">
                    <span className="detail-label">Donor</span>
                    <span className="detail-value">
                      {qrDonation?.donorName || formData.name}
                    </span>
                  </div>
                  <div className="qr-detail-item">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value amount">
                      ₹{qrDonation?.amount || formData.amount}
                    </span>
                  </div>
                  <div className="qr-detail-item">
                    <span className="detail-label">UPI ID</span>
                    <span className="detail-value">
                      {settings.upiId || "Not configured"}
                    </span>
                  </div>
                </div>

                <div className="qr-verification">
                  <h3>After Payment</h3>
                  <form onSubmit={handleQRSubmit}>
                    <div className="form-group">
                      <label>
                        UPI Transaction ID <span>*</span>
                      </label>
                      <input
                        type="text"
                        name="upiId"
                        placeholder="e.g., 1234567890"
                        required
                      />
                      <small>Enter the transaction ID from your UPI app</small>
                    </div>
                    <button
                      type="submit"
                      className="btn-primary qr-submit-btn"
                      disabled={loading}
                    >
                      <FaCheckCircle />{" "}
                      {loading ? "Verifying..." : "Submit for Verification"}
                    </button>
                  </form>
                  <button
                    className="btn-secondary back-btn"
                    onClick={() => setShowQR(false)}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            <div className="secure-badge">
              <FaLock className="lock-icon" />
              <span>Secure payment via Razorpay</span>
              <FaShieldAlt className="shield-icon" />
            </div>
          </div>

          <div className="donate-sidebar">
            <div className="sidebar-card">
              <h3>
                <FaHands /> Why Donate?
              </h3>
              <ul>
                <li>
                  <FaHeart /> Support community celebration
                </li>
                <li>
                  <FaChartBar /> 100% transparent system
                </li>
                <li>
                  <FaFileInvoice /> Get digital receipt
                </li>
                <li>
                  <FaHands /> Contribute to culture
                </li>
              </ul>
            </div>
            <div className="sidebar-card">
              <h3>
                <FaPhoneAlt /> Contact
              </h3>
              <p>
                <FaPhoneAlt /> +91 8431776329
              </p>
              <p>
                <FaEnvelope /> mahakalganeshkeb@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
