import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaInfoCircle,
  FaPray,
  FaCalendarAlt,
  FaDonate,
  FaChartBar,
  FaImages,
  FaVideo,
  FaMemory,
  FaBullhorn,
  FaUsers,
  FaEnvelope,
  FaSignInAlt,
  FaUserShield,
  FaSignOutAlt,
  FaHands,
  FaMoneyBill,
  FaCog,
  FaUserFriends,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/events", label: "Events", icon: <FaCalendarAlt /> },
    { path: "/donate", label: "Donate", icon: <FaDonate /> },
    { path: "/transparency", label: "Transparency", icon: <FaChartBar /> },
    { path: "/gallery", label: "Gallery", icon: <FaImages /> },
    { path: "/videos", label: "Videos", icon: <FaVideo /> },
    { path: "/memories", label: "Memories", icon: <FaMemory /> },
    { path: "/announcements", label: "Announcements", icon: <FaBullhorn /> },
    { path: "/volunteers", label: "Volunteers", icon: <FaUsers /> },
    { path: "/contact", label: "Contact", icon: <FaEnvelope /> },
  ];

  const adminLinks = [
    { path: "/admin", label: "Dashboard", icon: <FaUserShield /> },
    { path: "/admin/chanda", label: "Chanda", icon: <FaHands /> },
    { path: "/admin/donations", label: "Donations", icon: <FaDonate /> },
    { path: "/admin/expenses", label: "Expenses", icon: <FaMoneyBill /> },
    { path: "/admin/events", label: "Events", icon: <FaCalendarAlt /> },
    { path: "/admin/gallery", label: "Gallery", icon: <FaImages /> },
    { path: "/admin/videos", label: "Videos", icon: <FaVideo /> },
    {
      path: "/admin/announcements",
      label: "Announcements",
      icon: <FaBullhorn />,
    },
    { path: "/admin/volunteers", label: "Volunteers", icon: <FaUserFriends /> },
    { path: "/admin/reports", label: "Reports", icon: <FaChartBar /> },
    { path: "/admin/settings", label: "Settings", icon: <FaCog /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
    setShowAdminDropdown(false);
  };

  const toggleAdminDropdown = () => {
    setShowAdminDropdown(!showAdminDropdown);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img
            src="/android-chrome-192x192.png"
            alt="Mahakal Ganesh Mandal"
            className="brand-logo"
          />
          <div className="brand-text">
            <span className="brand-name">Mahakal Ganesh</span>
            <span className="brand-sub">Mandal, KEB Road</span>
          </div>
        </Link>

        <div className="navbar-links">
          {/* Public Links - Always visible */}
          {navLinks.slice(0, 6).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? "active" : ""}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {/* Admin Section - Only visible when authenticated */}
          {isAuthenticated && (
            <div className="nav-admin-section">
              <button className="nav-admin-btn" onClick={toggleAdminDropdown}>
                <FaUserShield /> Admin <span className="dropdown-arrow">▼</span>
              </button>
              {showAdminDropdown && (
                <div className="nav-admin-dropdown">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`nav-admin-link ${isActive(link.path) ? "active" : ""}`}
                      onClick={() => {
                        setShowAdminDropdown(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {link.icon} {link.label}
                    </Link>
                  ))}
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="nav-logout-btn">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {/* Public Links */}
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${isActive(link.path) ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}

          {/* Admin Links - Only visible when authenticated */}
          {isAuthenticated && (
            <>
              <hr className="mobile-divider" />
              <div className="mobile-admin-section">
                <div className="mobile-admin-header">Admin Panel</div>
                {adminLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="mobile-nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
