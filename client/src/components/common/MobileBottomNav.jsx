import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaPray,
  FaDonate,
  FaCalendarAlt,
  FaChartBar,
} from "react-icons/fa";
import "./MobileBottomNav.css";

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/darshan", icon: <FaPray />, label: "Darshan" },
    { path: "/donate", icon: <FaDonate />, label: "Donate", isDonate: true },
    { path: "/events", icon: <FaCalendarAlt />, label: "Events" },
    { path: "/transparency", icon: <FaChartBar />, label: "Transparency" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${isActive(item.path) ? "active" : ""} ${item.isDonate ? "donate-btn" : ""}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
          {item.isDonate && <span className="donate-pulse"></span>}
        </Link>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
