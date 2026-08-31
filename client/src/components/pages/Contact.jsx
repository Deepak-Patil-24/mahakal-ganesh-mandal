import React from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";
import "./Pages.css";

const Contact = () => {
  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">📞 Contact Us</h1>
        <p className="section-subtitle">
          Get in touch with Mahakal Ganesh Mandal
        </p>

        <div className="contact-info-grid">
          <div className="contact-card">
            <div className="contact-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="contact-details">
              <h4>📍 Address</h4>
              <p>KEB Road Old Mailoor, Bidar</p>
              <p>Karnataka 585403, India</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <FaPhone />
            </div>
            <div className="contact-details">
              <h4>📞 Phone</h4>
              <p>+91 8431776329</p>
              <p>Available 24/7</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <FaEnvelope />
            </div>
            <div className="contact-details">
              <h4>✉️ Email</h4>
              <p>mahakalganeshkeb@gmail.com</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <FaClock />
            </div>
            <div className="contact-details">
              <h4>🕐 Darshan Timings</h4>
              <p>Morning: 6:00 AM - 12:00 PM</p>
              <p>Evening: 4:00 PM - 9:00 PM</p>
            </div>
          </div>
        </div>

        {/* Small map/location link */}
        <div className="contact-map-link">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=17.886994,77.506152"
            target="_blank"
            rel="noopener noreferrer"
            className="directions-btn"
          >
            <FaMapMarkerAlt /> Get Directions to Our Pandal
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
