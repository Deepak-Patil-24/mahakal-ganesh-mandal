import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./MobileBottomNav.css";

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: "🏠", label: "Home" },
    { path: "/darshan", icon: "🪔", label: "Darshan" },
    { path: "/donate", icon: "🙏", label: "Donate" },
    { path: "/events", icon: "📅", label: "Events" },
    { path: "/transparency", icon: "📊", label: "Transparency" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${isActive(item.path) ? "active" : ""}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
