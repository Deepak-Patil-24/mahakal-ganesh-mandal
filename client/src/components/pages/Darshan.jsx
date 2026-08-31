import React from "react";
import "./Pages.css";

const Darshan = () => {
  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">🪔 Ganesh Darshan</h1>
        <p className="section-subtitle">
          Experience the divine presence of Lord Ganesha
        </p>

        <div className="darshan-content">
          <div className="darshan-card">
            <div className="darshan-image-placeholder">
              <span>🪔</span>
              <p>Ganesh Idol</p>
            </div>
            <div className="darshan-info">
              <h3>Darshan Timings</h3>
              <ul>
                <li>
                  <strong>Morning:</strong> 6:00 AM - 12:00 PM
                </li>
                <li>
                  <strong>Evening:</strong> 4:00 PM - 9:00 PM
                </li>
              </ul>
              <h3>Aarti Timings</h3>
              <ul>
                <li>
                  <strong>Morning Aarti:</strong> 6:30 AM
                </li>
                <li>
                  <strong>Evening Aarti:</strong> 7:30 PM
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Darshan;
