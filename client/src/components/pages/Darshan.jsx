import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaClock,
  FaSun,
  FaMoon,
  FaPray,
  FaCalendarAlt,
  FaInfoCircle,
  FaBell,
  FaClock as FaTime,
} from "react-icons/fa";
import api from "../../utils/api";
import "./Pages.css";

const Darshan = () => {
  const [settings, setSettings] = useState({
    aartiTimings: { morning: "6:30 AM", evening: "7:30 PM" },
    darshanTimings: {
      morning: "6:00 AM - 12:00 PM",
      evening: "4:00 PM - 9:00 PM",
    },
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchSettings();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings/public");
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine if it's morning or evening
  const hour = currentTime.getHours();
  const isMorning = hour >= 6 && hour < 12;
  const isEvening = hour >= 16 && hour < 21;
  const isNight = hour >= 21 || hour < 6;

  const getTimeOfDay = () => {
    if (isMorning)
      return { icon: <FaSun />, label: "Morning", color: "#f39c12" };
    if (isEvening)
      return { icon: <FaSun />, label: "Evening", color: "#e67e22" };
    if (isNight) return { icon: <FaMoon />, label: "Night", color: "#2c3e50" };
    return { icon: <FaClock />, label: "Day", color: "#3498db" };
  };

  const timeOfDay = getTimeOfDay();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  if (loading) {
    return (
      <div className="darshan-loading">
        <div className="loading-spinner"></div>
        <p>Loading darshan timings...</p>
      </div>
    );
  }

  return (
    <div className="page-container darshan-page">
      <div className="container">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="darshan-wrapper"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="darshan-header">
            <h1 className="section-title">
              <FaPray className="header-icon" /> Ganesh Darshan
            </h1>
            <p className="section-subtitle">
              Experience the divine presence of Lord Ganesha
            </p>
          </motion.div>

          {/* Current Status */}
          <motion.div variants={cardVariants} className="status-card">
            <div className="status-icon" style={{ color: timeOfDay.color }}>
              {timeOfDay.icon}
            </div>
            <div className="status-info">
              <h3>Current Time: {currentTime.toLocaleTimeString()}</h3>
              <p>
                <span
                  className="status-badge"
                  style={{ backgroundColor: timeOfDay.color }}
                >
                  {timeOfDay.label} Darshan
                </span>
                {isMorning && " ✨ Morning blessings"}
                {isEvening && " 🌅 Evening aarti"}
                {isNight && " 🌙 Night prayers"}
              </p>
            </div>
          </motion.div>

          {/* Darshan Timings */}
          <motion.div variants={itemVariants} className="darshan-grid">
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="timing-card morning-card"
            >
              <div className="timing-icon morning-icon">
                <FaSun />
              </div>
              <h3>Morning Darshan</h3>
              <div className="timing-time">
                <FaTime className="time-icon" />
                <span>
                  {settings.darshanTimings?.morning || "6:00 AM - 12:00 PM"}
                </span>
              </div>
              <div className="timing-details">
                <p>
                  <FaBell className="detail-icon" />
                  Morning Aarti: {settings.aartiTimings?.morning || "6:30 AM"}
                </p>
                <p className="timing-note">
                  🌅 Start your day with divine blessings
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="timing-card evening-card"
            >
              <div className="timing-icon evening-icon">
                <FaMoon />
              </div>
              <h3>Evening Darshan</h3>
              <div className="timing-time">
                <FaTime className="time-icon" />
                <span>
                  {settings.darshanTimings?.evening || "4:00 PM - 9:00 PM"}
                </span>
              </div>
              <div className="timing-details">
                <p>
                  <FaBell className="detail-icon" />
                  Evening Aarti: {settings.aartiTimings?.evening || "7:30 PM"}
                </p>
                <p className="timing-note">
                  🌇 End your day with peace and devotion
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Aarti Details */}
          <motion.div variants={itemVariants} className="aarti-section">
            <h3>
              <FaBell className="section-icon" /> Aarti Timings
            </h3>
            <div className="aarti-grid">
              <div className="aarti-item">
                <div className="aarti-time">Morning</div>
                <div className="aarti-time-value">
                  <FaClock />
                  {settings.aartiTimings?.morning || "6:30 AM"}
                </div>
                <p className="aarti-desc">Start your day with prayers</p>
              </div>
              <div className="aarti-divider"></div>
              <div className="aarti-item">
                <div className="aarti-time">Evening</div>
                <div className="aarti-time-value">
                  <FaClock />
                  {settings.aartiTimings?.evening || "7:30 PM"}
                </div>
                <p className="aarti-desc">Evening prayers and blessings</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Darshan;
