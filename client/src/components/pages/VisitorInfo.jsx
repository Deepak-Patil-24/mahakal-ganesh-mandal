import React from "react";
import { FaMapMarkerAlt, FaPhone, FaClock, FaEnvelope } from "react-icons/fa";
import "./Pages.css";

const VisitorInfo = () => {
  // Ganesh Pandal Location
  const location = {
    lat: 17.886994,
    lng: 77.506152,
    address: "KEB Road Old Mailoor, Bidar, Karnataka 585403, India",
  };

  // Clean embed map URL - Using Google Maps embed correctly
  const embedMapUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}&hl=en&output=embed`;

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">📍 Visitor Information</h1>
        <p className="section-subtitle">
          Find us at KEB Road Old Mailoor, Bidar
        </p>

        {/* Map Section */}
        <div className="visitor-map-section">
          <div className="map-container">
            <iframe
              title="Ganesh Pandal Location"
              src={embedMapUrl}
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: "16px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="map-address">
            <div className="address-info">
              <FaMapMarkerAlt className="address-icon" />
              <div>
                <h3>Ganesh Pandal Location</h3>
                <p>{location.address}</p>
                <div className="address-coords">
                  <span>
                    📍 {location.lat}, {location.lng}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn"
            >
              <FaMapMarkerAlt /> Get Directions
            </a>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="contact-info-grid">
          <div className="contact-card">
            <div className="contact-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="contact-details">
              <h4>Address</h4>
              <p>KEB Road Old Mailoor, Bidar</p>
              <p>Karnataka 585403</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <FaPhone />
            </div>
            <div className="contact-details">
              <h4>Phone</h4>
              <p>+91 8431776329</p>
              <p>Available 24/7</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <FaEnvelope />
            </div>
            <div className="contact-details">
              <h4>Email</h4>
              <p>info@mahakalganesh.com</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <FaClock />
            </div>
            <div className="contact-details">
              <h4>Darshan Timings</h4>
              <p>Morning: 6:00 AM - 12:00 PM</p>
              <p>Evening: 4:00 PM - 9:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorInfo;
