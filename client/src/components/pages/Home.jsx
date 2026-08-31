import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaDonate,
  FaImages,
  FaChartBar,
  FaCalendarAlt,
  FaArrowRight,
  FaClock,
  FaQrcode,
  FaUser,
  FaPhone,
  FaMoneyBill,
  FaCheckCircle,
  FaRocket,
  FaBuilding,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Home.css";

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [donations, setDonations] = useState([]);
  const [settings, setSettings] = useState({ qrCodeUrl: "", upiId: "" });
  const [totals, setTotals] = useState({
    totalDonations: 0,
    totalExpenses: 0,
    balance: 0,
    donorCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showQRForm, setShowQRForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQRInstructions, setShowQRInstructions] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [qrFormData, setQrFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    upiTransactionId: "",
  });
  const [qrSubmitting, setQrSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  useEffect(() => {
    fetchHomeData();
    fetchSettings();
  }, []);

  useEffect(() => {
    const slideImages =
      photos.length > 0
        ? photos
        : [
            {
              id: 1,
              url: "https://images.unsplash.com/photo-1580216643062-e6f7de10cf7b?w=800",
              caption: "Ganesh Idol",
            },
            {
              id: 2,
              url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
              caption: "Pandal Decoration",
            },
            {
              id: 3,
              url: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800",
              caption: "Evening Aarti",
            },
          ];

    if (slideImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slideImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [photos]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        setVideoError(false);
        video.muted = true;
        video.volume = 0.7;
        video.loop = true;
        video.playsInline = true;

        const playPromise = video.play();

        if (playPromise !== undefined) {
          await playPromise;
          console.log("Video is playing");

          const handleUserInteraction = async () => {
            try {
              video.muted = false;
              await video.play();
              console.log("Video unmuted");
            } catch (error) {
              console.log("Could not unmute video:", error);
            }
          };

          document.addEventListener("click", handleUserInteraction);
          document.addEventListener("touchstart", handleUserInteraction);

          return () => {
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("touchstart", handleUserInteraction);
          };
        }
      } catch (error) {
        console.warn("Video playback failed:", error);
        setVideoError(true);
      }
    };

    playVideo();

    return () => {
      if (video) {
        video.pause();
      }
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

  const fetchHomeData = async () => {
    try {
      const [announcementsRes, eventsRes, photosRes, donationsRes] =
        await Promise.all([
          api.get("/announcements/public?limit=3"),
          api.get("/events/upcoming"),
          api.get("/photos"),
          api.get("/donations/public"),
        ]);

      setAnnouncements(announcementsRes.data.data || []);
      setUpcomingEvents(eventsRes.data.data || []);
      setPhotos(photosRes.data.data || []);
      setDonations(donationsRes.data.data || []);
      setTotals({
        totalDonations: donationsRes.data.totals?.totalDonations || 0,
        totalExpenses: 0,
        balance: donationsRes.data.totals?.totalDonations || 0,
        donorCount: donationsRes.data.totals?.donorCount || 0,
      });
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRChange = (e) => {
    const { name, value } = e.target;
    setQrFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQRSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!qrFormData.name || !qrFormData.phone || !qrFormData.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      !qrFormData.upiTransactionId ||
      qrFormData.upiTransactionId.trim().length < 3
    ) {
      toast.error("Please enter the UPI Transaction ID from your payment app");
      return;
    }

    setQrSubmitting(true);
    try {
      const response = await api.post("/chanda/qr", {
        name: qrFormData.name,
        phone: qrFormData.phone,
        amount: parseFloat(qrFormData.amount),
        paymentMethod: "QR Code",
        upiTransactionId: qrFormData.upiTransactionId.trim(),
      });

      if (response.data.success) {
        setSuccessData(response.data.data);
        setShowSuccessModal(true);
        setQrFormData({
          name: "",
          phone: "",
          amount: "",
          upiTransactionId: "",
        });
        setShowQRForm(false);
        setShowQRInstructions(false);
        fetchHomeData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record Chanda");
    } finally {
      setQrSubmitting(false);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    const slideImages =
      photos.length > 0
        ? photos
        : [
            {
              id: 1,
              url: "https://images.unsplash.com/photo-1580216643062-e6f7de10cf7b?w=800",
              caption: "Ganesh Idol",
            },
            {
              id: 2,
              url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
              caption: "Pandal Decoration",
            },
            {
              id: 3,
              url: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800",
              caption: "Evening Aarti",
            },
          ];
    setCurrentSlide((prev) => (prev + 1) % slideImages.length);
  };

  const prevSlide = () => {
    const slideImages =
      photos.length > 0
        ? photos
        : [
            {
              id: 1,
              url: "https://images.unsplash.com/photo-1580216643062-e6f7de10cf7b?w=800",
              caption: "Ganesh Idol",
            },
            {
              id: 2,
              url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
              caption: "Pandal Decoration",
            },
            {
              id: 3,
              url: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800",
              caption: "Evening Aarti",
            },
          ];
    setCurrentSlide(
      (prev) => (prev - 1 + slideImages.length) % slideImages.length,
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  const recentDonations = donations.slice(0, 6);

  const slideImages =
    photos.length > 0
      ? photos
      : [
          {
            id: 1,
            url: "https://images.unsplash.com/photo-1580216643062-e6f7de10cf7b?w=800",
            caption: "Ganesh Idol",
          },
          {
            id: 2,
            url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
            caption: "Pandal Decoration",
          },
          {
            id: 3,
            url: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800",
            caption: "Evening Aarti",
          },
        ];

  return (
    <motion.div
      className="app"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero with Video Background */}
      <section className="hero">
        <div className="hero-video-wrapper">
          {!videoError ? (
            <video
              ref={videoRef}
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="https://images.unsplash.com/photo-1580216643062-e6f7de10cf7b?w=800"
              onError={() => setVideoError(true)}
            >
              <source src="/videos/ganesh-bg.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="hero-fallback-image">
              <img
                src="https://images.unsplash.com/photo-1580216643062-e6f7de10cf7b?w=800"
                alt="Ganesh Background"
                className="hero-video-fallback"
              />
            </div>
          )}
          <div className="hero-video-overlay"></div>
        </div>

        <div className="hero-overlay-content">
          <div className="container hero-container">
            <motion.div className="hero-content" variants={containerVariants}>
              <motion.div className="hero-title-wrapper" variants={fadeInUp}>
                <span className="hero-title-line">
                  <span className="title-main">Mahakal</span>
                </span>
                <span className="hero-title-line">
                  <span className="title-accent">Ganesh Mandal</span>
                </span>
                <motion.div
                  className="title-underline"
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ duration: 1.2, delay: 0.8 }}
                />
              </motion.div>

              <motion.p className="hero-desc" variants={fadeInUp}>
                <FaBuilding className="desc-icon" />
                KEB Road, Old Mailoor, Bidar
              </motion.p>

              <motion.div className="hero-stats" variants={staggerContainer}>
                {[
                  {
                    value: `₹${totals.balance?.toLocaleString() || "0"}`,
                    label: "Total Balance",
                  },
                  {
                    value: `₹${totals.totalDonations?.toLocaleString() || "0"}`,
                    label: "Total Donations",
                  },
                  { value: totals.donorCount || 0, label: "Devotees" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="stat"
                    variants={fadeInScale}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  >
                    <motion.div
                      className="stat-number"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.15 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="stat-label">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div className="hero-actions" variants={fadeInUp}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => setShowQRInstructions(true)}
                    className="btn-primary"
                  >
                    <FaQrcode />
                    Chanda
                    <FaRocket className="btn-rocket" />
                  </button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/transparency" className="btn-secondary">
                    <FaChartBar />
                    Transparency
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* QR Instructions Modal */}
      <AnimatePresence>
        {showQRInstructions && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal instructions-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="instructions-header">
                <FaQrcode className="instructions-icon" />
                <h2>Scan and Pay</h2>
              </div>

              <div className="instructions-body">
                <div className="instruction-step">
                  <span className="step-number">1</span>
                  <div>
                    <h4>Scan the QR Code</h4>
                    <p>Open your UPI app and scan the QR code below</p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="step-number">2</span>
                  <div>
                    <h4>Enter Amount</h4>
                    <p>Enter the amount you wish to donate</p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="step-number">3</span>
                  <div>
                    <h4>Make Payment</h4>
                    <p>Complete the payment using your UPI app</p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="step-number">4</span>
                  <div>
                    <h4>Record Your Chanda</h4>
                    <p>
                      Fill the form below with your details and transaction ID
                    </p>
                  </div>
                </div>
              </div>

              <div className="instruction-qr">
                <div className="qr-code-small">
                  {settings.qrCodeUrl ? (
                    <img src={settings.qrCodeUrl} alt="QR Code" />
                  ) : (
                    <div className="qr-placeholder-small">
                      <FaQrcode />
                      <p>QR Code not configured</p>
                    </div>
                  )}
                </div>
                <div className="instruction-upi">
                  <span>UPI ID: </span>
                  <strong>{settings.upiId || "Not configured"}</strong>
                </div>
              </div>

              <div className="modal-actions">
                <motion.button
                  className="btn-primary"
                  onClick={() => {
                    setShowQRInstructions(false);
                    setShowQRForm(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  I've Made the Payment
                </motion.button>
                <motion.button
                  className="btn-close-modal"
                  onClick={() => setShowQRInstructions(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Form Modal */}
      <AnimatePresence>
        {showQRForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal qr-form-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <h3>Record Your Chanda</h3>
              <p>Enter your details after payment</p>

              <form onSubmit={handleQRSubmit}>
                {[
                  {
                    icon: FaUser,
                    name: "name",
                    label: "Full Name",
                    placeholder: "Enter your name",
                  },
                  {
                    icon: FaPhone,
                    name: "phone",
                    label: "Phone Number",
                    placeholder: "Enter phone number",
                  },
                  {
                    icon: FaMoneyBill,
                    name: "amount",
                    label: "Amount (₹)",
                    placeholder: "Enter amount",
                    type: "number",
                  },
                  {
                    icon: FaCheckCircle,
                    name: "upiTransactionId",
                    label: "Transaction ID",
                    placeholder: "Enter transaction ID",
                  },
                ].map((field) => (
                  <div key={field.name} className="form-group">
                    <label>
                      <field.icon />
                      {field.label}
                      <span className="required">*</span>
                    </label>
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={qrFormData[field.name]}
                      onChange={handleQRChange}
                      placeholder={field.placeholder}
                      required
                      min={field.name === "amount" ? "1" : undefined}
                    />
                  </div>
                ))}

                <motion.button
                  type="submit"
                  className="btn-primary full"
                  disabled={qrSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {qrSubmitting ? (
                    <span className="spinner"></span>
                  ) : (
                    <>Submit Chanda</>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  className="btn-close-modal full"
                  onClick={() => setShowQRForm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal - Fixed Print Button */}
      <AnimatePresence>
        {showSuccessModal && successData && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <motion.div
                className="modal-icon success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <FaCheckCircle />
              </motion.div>
              <h2>Chanda Recorded!</h2>
              <p className="modal-sub">Pending verification</p>

              <div className="modal-details">
                {[
                  { label: "Chanda ID", value: successData.chandaId },
                  { label: "Name", value: successData.name },
                  {
                    label: "Amount",
                    value: `₹${successData.amount.toLocaleString()}`,
                    highlight: true,
                  },
                  {
                    label: "Transaction ID",
                    value: successData.upiTransactionId,
                  },
                  {
                    label: "Status",
                    value: "Pending Verification",
                    badge: true,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className={`modal-row ${item.highlight ? "highlight" : ""}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span>{item.label}</span>
                    <span className={item.badge ? "badge-pending" : ""}>
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="modal-actions">
                <motion.button
                  className="btn-primary"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSuccessData(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Done
                </motion.button>
                {/* FIXED: Print button with visible text */}
                <motion.button
                  className="btn-print"
                  onClick={() => window.print()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaImages /> Print
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events & Announcements Section */}
      <section className="section events-announcements">
        <div className="container">
          <div className="events-announcements-grid">
            {/* Events Column */}
            <div className="ea-column">
              <motion.div
                className="section-header-small"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="section-title-small">
                  <FaCalendarAlt /> Upcoming Events
                </h2>
                <p className="section-desc-small">Join our celebration</p>
              </motion.div>

              {upcomingEvents.length === 0 ? (
                <div className="empty-small">No upcoming events</div>
              ) : (
                <div className="events-list">
                  {upcomingEvents.slice(0, 3).map((event, index) => (
                    <motion.div
                      key={event._id || event.id}
                      className="event-item"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeInScale}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 6, transition: { duration: 0.2 } }}
                    >
                      <div className="event-item-date">
                        <span className="event-item-day">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="event-item-month">
                          {new Date(event.date).toLocaleString("default", {
                            month: "short",
                          })}
                        </span>
                      </div>
                      <div className="event-item-content">
                        <h4>{event.name}</h4>
                        <div className="event-item-meta">
                          <span>
                            <FaClock />
                            {event.startTime}
                          </span>
                          {event.location && (
                            <span>
                              <FaBuilding />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <span
                          className={`event-item-status ${event.status?.toLowerCase() || "upcoming"}`}
                        >
                          {event.status || "UPCOMING"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <motion.div
                className="view-all-small"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <Link to="/events" className="view-all">
                  View All Events <FaArrowRight />
                </Link>
              </motion.div>
            </div>

            {/* Announcements Column */}
            <div className="ea-column">
              <motion.div
                className="section-header-small"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="section-title-small">Latest Updates</h2>
                <p className="section-desc-small">Stay informed</p>
              </motion.div>

              {announcements.length === 0 ? (
                <div className="empty-small">No announcements</div>
              ) : (
                <div className="announcements-list">
                  {announcements.slice(0, 3).map((announcement, index) => (
                    <motion.div
                      key={announcement.id || announcement._id}
                      className="announcement-item"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeInScale}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 6, transition: { duration: 0.2 } }}
                    >
                      <div className="announcement-item-badge">
                        {announcement.type || "General"}
                      </div>
                      <h4>{announcement.title}</h4>
                      <p>{announcement.content}</p>
                      <span className="announcement-item-date">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              <motion.div
                className="view-all-small"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <Link to="/announcements" className="view-all">
                  View All Announcements <FaArrowRight />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Donors Section */}
      <section className="section donors">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="section-title">
              <FaDonate /> Recent Donors
            </h2>
            <p className="section-desc">Thank you to our supporters</p>
          </motion.div>

          {recentDonations.length === 0 ? (
            <div className="empty">No donations yet</div>
          ) : (
            <div className="donors-grid">
              {recentDonations.map((donation, index) => (
                <motion.div
                  key={donation._id || donation.id}
                  className="donor-card"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInScale}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="donor-avatar">
                    {donation.isAnonymous
                      ? "A"
                      : donation.donorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="donor-info">
                    <h4>
                      {donation.isAnonymous ? "Anonymous" : donation.donorName}
                    </h4>
                    <span className="donor-amount">
                      ₹{donation.amount.toLocaleString()}
                    </span>
                    <span
                      className={`donor-payment ${donation.paymentMethod?.toLowerCase() || "upi"}`}
                    >
                      {donation.paymentMethod || "UPI"}
                    </span>
                  </div>
                  <div className="donor-date">
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {donations.length > 6 && (
            <motion.div
              className="view-all-wrapper"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Link to="/transparency" className="view-all">
                View All Donors <FaArrowRight />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Slideshow */}
      <section className="section slideshow">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="section-title">
              <FaImages /> Moments
            </h2>
          </motion.div>

          <div className="slideshow-container">
            <motion.div
              className="slideshow-track"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {slideImages.map((image, index) => (
                <div
                  key={image.id || image._id}
                  className={`slide ${index === currentSlide ? "active" : ""}`}
                >
                  <img src={image.url} alt={image.caption} />
                  <div className="slide-caption">{image.caption}</div>
                </div>
              ))}
            </motion.div>

            <motion.button
              className="slide-nav prev"
              onClick={prevSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowRight />
            </motion.button>
            <motion.button
              className="slide-nav next"
              onClick={nextSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowRight />
            </motion.button>

            <div className="slide-dots">
              {slideImages.map((_, index) => (
                <motion.button
                  key={index}
                  className={`dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="section actions">
        <div className="container">
          <motion.h2
            className="section-title center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            Quick Actions
          </motion.h2>

          <div className="actions-grid">
            {[
              {
                icon: FaDonate,
                title: "Donate",
                desc: "Support the festival",
                link: "/donate",
              },
              {
                icon: FaCalendarAlt,
                title: "Events",
                desc: "View all events",
                link: "/events",
              },
              {
                icon: FaImages,
                title: "Gallery",
                desc: "View photos",
                link: "/gallery",
              },
              {
                icon: FaChartBar,
                title: "Transparency",
                desc: "Financial details",
                link: "/transparency",
              },
            ].map((action, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInScale}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Link to={action.link} className="action-card">
                  <motion.div
                    className="action-icon"
                    whileHover={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <action.icon />
                  </motion.div>
                  <h3>{action.title}</h3>
                  <p>{action.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
