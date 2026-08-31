import React from "react";
import {
  FaHands,
  FaUsers,
  FaCalendar,
  FaHeart,
  FaTrophy,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import "./Pages.css";

const About = () => {
  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">About Us</h1>
        <p className="section-subtitle">MAHAKAL GANESH MANDAL, KEB ROAD</p>

        <div className="about-content">
          <div className="about-card">
            {/* Hero Section */}
            <div className="about-hero">
              <span className="about-icon">🪔</span>
              <h2>MAHAKAL GANESH MANDAL</h2>
              <p className="about-location">
                KEB Road Old Mailoor, Bidar, Karnataka 585403
              </p>
            </div>

            {/* About Text */}
            <div className="about-text">
              <p>
                <strong>Mahakal Ganesh Mandal</strong> is a community-driven
                organization dedicated to celebrating the Ganesh Utsav festival
                with devotion, grandeur, and complete transparency. Established
                with the vision of bringing the community together, we have been
                organizing this festival for over a decade.
              </p>
              <p>
                Our mission is to promote cultural values, social harmony, and
                community bonding through the celebration of Lord Ganesha's
                festival. We believe in complete transparency in all our
                activities, especially in financial matters.
              </p>
            </div>

            {/* Core Values */}
            <div className="about-values">
              <h3>Our Core Values</h3>
              <div className="values-grid">
                <div className="value-item">
                  <FaShieldAlt className="value-icon" />
                  <h4>Transparency</h4>
                  <p>Complete financial transparency in all activities</p>
                </div>
                <div className="value-item">
                  <FaHeart className="value-icon" />
                  <h4>Devotion</h4>
                  <p>Deep spiritual connection with Lord Ganesha</p>
                </div>
                <div className="value-item">
                  <FaUsers className="value-icon" />
                  <h4>Community</h4>
                  <p>Bringing people together through celebration</p>
                </div>
                <div className="value-item">
                  <FaTrophy className="value-icon" />
                  <h4>Excellence</h4>
                  <p>Organizing grand and memorable festivals</p>
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="about-location-section">
              <h3>Visit Us</h3>
              <div className="location-details">
                <p>
                  <FaMapMarkerAlt className="location-icon" />
                  KEB Road Old Mailoor, Bidar, Karnataka 585403
                </p>
                <p>
                  <FaPhone className="location-icon" />
                  +91 84317 76329
                </p>
                <p>
                  <FaEnvelope className="location-icon" />
                  mahakalganeshkeb@gmail.com
                </p>
                <p>
                  <FaClock className="location-icon" />
                  Darshan Timings: 6:00 AM - 12:00 PM | 4:00 PM - 9:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
