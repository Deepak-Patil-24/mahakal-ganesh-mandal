import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaCalendarAlt,
  FaDonate,
  FaChartBar,
  FaImages,
  FaVideo,
  FaMemory,
  FaBullhorn,
  FaUsers,
  FaEnvelope,
  FaUserShield,
  FaSignOutAlt,
  FaHands,
  FaMoneyBill,
  FaCog,
  FaUserFriends,
  FaChevronDown,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const { isAuthenticated, logout } = useAuth();
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (showAdminDropdown) setShowAdminDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
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

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {/* Public Links - First 6 */}
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

          {/* Admin Section */}
          {isAuthenticated && (
            <div className="nav-admin-section">
              <button
                className="nav-admin-btn"
                onClick={toggleAdminDropdown}
                aria-expanded={showAdminDropdown}
              >
                <FaUserShield />
                <span>Admin</span>
                <FaChevronDown
                  className={`dropdown-arrow ${showAdminDropdown ? "open" : ""}`}
                />
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
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="nav-logout-btn">
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {/* Public Links */}
          <div className="mobile-nav-section">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${isActive(link.path) ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Admin Links */}
          {isAuthenticated && (
            <div className="mobile-admin-section">
              <div className="mobile-divider"></div>
              <div className="mobile-admin-header">
                <FaUserShield /> Admin Panel
              </div>
              {adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              <button onClick={handleLogout} className="mobile-logout-btn">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
