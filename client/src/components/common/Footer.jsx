import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaYoutube,
  FaHome,
  FaDonate,
  FaCalendarAlt,
  FaImages,
  FaChartBar,
  FaEnvelope,
  FaInfoCircle,
  FaClock,
  FaPhone,
  FaArrowRight,
} from "react-icons/fa";
import api from "../../utils/api";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({
    socialMedia: { instagram: "", youtube: "" },
    pandalAddress: "KEB Road Old Mailoor, Bidar",
    contactNumber: "+91 8431776329",
    aartiTimings: { morning: "6:00 AM", evening: "7:30 PM" },
  });

  useEffect(() => {
    fetchSettings();
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

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="footer-brand-name">
              MAHAKAL GANESH MANDAL, KEB ROAD
            </h3>
            <p className="footer-tagline">Ganpati Bappa Morya 🙏</p>
            <div className="footer-social">
              {settings.socialMedia?.instagram && (
                <a
                  href={settings.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              )}
              {settings.socialMedia?.youtube && (
                <a
                  href={settings.socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="YouTube"
                >
                  <FaYoutube />
                </a>
              )}
              {!settings.socialMedia?.instagram &&
                !settings.socialMedia?.youtube && (
                  <span className="social-placeholder">
                    Follow us on social media
                  </span>
                )}
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/">
              <FaHome /> Home
            </Link>
            <Link to="/about">
              <FaInfoCircle /> About Us
            </Link>
            <Link to="/donate">
              <FaDonate /> Donate
            </Link>
            <Link to="/events">
              <FaCalendarAlt /> Events
            </Link>
            <Link to="/gallery">
              <FaImages /> Gallery
            </Link>
            <Link to="/transparency">
              <FaChartBar /> Transparency
            </Link>
            <Link to="/contact">
              <FaEnvelope /> Contact
            </Link>
          </div>

          <div className="footer-links">
            <h4>Community</h4>
            <Link to="/volunteers">Volunteers</Link>
            <Link to="/lost-found">Lost & Found</Link>
            <Link to="/visitor-info">Visitor Info</Link>
            <Link to="/announcements">Announcements</Link>
            <Link to="/memories">Memories</Link>
            <Link to="/videos">Videos</Link>
          </div>

          <div className="footer-contact">
            <h4>📍 Find Us</h4>
            <p>{settings.pandalAddress || "KEB Road Old Mailoor, Bidar"}</p>
            <p className="footer-phone">
              <FaPhone /> {settings.contactNumber || "+91 8431776329"}
            </p>
            <div className="footer-timings">
              <p>
                <FaClock /> Aarti Timings:
              </p>
              <p>Morning: {settings.aartiTimings?.morning || "6:00 AM"}</p>
              <p>Evening: {settings.aartiTimings?.evening || "7:30 PM"}</p>
            </div>
            <Link to="/visitor-info" className="footer-visit-btn">
              Visit Our Ganesh <FaArrowRight />
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {currentYear} MAHAKAL GANESH MANDAL, KEB Road. All rights
            reserved.
          </p>
          <p className="footer-credit">🙏 Ganpati Bappa Morya</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
