import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaDonate,
  FaMoneyBill,
  FaWallet,
  FaUsers,
  FaCalendarAlt,
  FaImages,
  FaVideo,
  FaBullhorn,
  FaChartBar,
  FaCog,
  FaQrcode,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaHands,
  FaUserFriends,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaArrowRight,
  FaHome,
  FaInfoCircle,
  FaPray,
  FaEnvelope,
} from "react-icons/fa";
import api from "../../utils/api";
import "./Admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalChanda: 0,
    totalDonations: 0,
    totalExpenses: 0,
    balance: 0,
    chandaCount: 0,
    donationCount: 0,
    expenseCount: 0,
    volunteerCount: 0,
    eventCount: 0,
    announcementCount: 0,
    pendingDonations: 0,
  });
  const [recentChanda, setRecentChanda] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get Chanda data
      const chandaRes = await api.get("/chanda");
      const chandaData = chandaRes.data.data || [];
      const totalChanda = chandaRes.data.total || 0;

      // Get Donations data
      const donationRes = await api.get("/donations");
      const donationData = donationRes.data.data || [];
      const verifiedDonations = donationData.filter(
        (d) => d.status === "VERIFIED",
      );
      const totalDonations = verifiedDonations.reduce(
        (sum, d) => sum + d.amount,
        0,
      );
      const pendingDonations = donationData.filter(
        (d) => d.status === "PENDING",
      ).length;

      // Get Expenses data
      const expenseRes = await api.get("/expenses");
      const expenseData = expenseRes.data.data || [];
      const totalExpenses = expenseRes.data.total || 0;

      // Get Volunteers count
      const volunteerRes = await api.get("/volunteers/admin");
      const volunteerData = volunteerRes.data.data || [];

      // Get Events count
      const eventRes = await api.get("/events");
      const eventData = eventRes.data.data || [];

      // Get Announcements count
      const announcementRes = await api.get("/announcements");
      const announcementData = announcementRes.data.data || [];

      setStats({
        totalChanda: totalChanda,
        totalDonations: totalDonations,
        totalExpenses: totalExpenses,
        balance: totalChanda + totalDonations - totalExpenses,
        chandaCount: chandaData.length,
        donationCount: donationData.length,
        expenseCount: expenseData.length,
        volunteerCount: volunteerData.length,
        eventCount: eventData.length,
        announcementCount: announcementData.length,
        pendingDonations: pendingDonations,
      });

      setRecentChanda(chandaData.slice(0, 5));
      setRecentDonations(verifiedDonations.slice(0, 5));
      setRecentEvents(eventData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: "Add Chanda",
      icon: <FaHands />,
      path: "/admin/chanda",
      color: "#E87516",
    },
    {
      label: "Add Donation",
      icon: <FaDonate />,
      path: "/admin/donations",
      color: "#28a745",
    },
    {
      label: "Add Expense",
      icon: <FaMoneyBill />,
      path: "/admin/expenses",
      color: "#6B1E1E",
    },
    {
      label: "Add Event",
      icon: <FaCalendarAlt />,
      path: "/admin/events",
      color: "#17a2b8",
    },
    {
      label: "Add Volunteer",
      icon: <FaUsers />,
      path: "/admin/volunteers",
      color: "#6f42c1",
    },
    {
      label: "Add Announcement",
      icon: <FaBullhorn />,
      path: "/admin/announcements",
      color: "#fd7e14",
    },
    {
      label: "Upload Photos",
      icon: <FaImages />,
      path: "/admin/gallery",
      color: "#dc3545",
    },
    {
      label: "Upload QR Code",
      icon: <FaQrcode />,
      path: "/admin/settings",
      color: "#D4A017",
    },
    {
      label: "View Reports",
      icon: <FaChartBar />,
      path: "/admin/reports",
      color: "#20c997",
    },
    {
      label: "Settings",
      icon: <FaCog />,
      path: "/admin/settings",
      color: "#6c757d",
    },
  ];

  const adminSections = [
    {
      title: "Finance Management",
      icon: <FaWallet />,
      items: [
        { label: "Chanda", path: "/admin/chanda", icon: <FaHands /> },
        { label: "Donations", path: "/admin/donations", icon: <FaDonate /> },
        { label: "Expenses", path: "/admin/expenses", icon: <FaMoneyBill /> },
        { label: "Reports", path: "/admin/reports", icon: <FaChartBar /> },
      ],
    },
    {
      title: "Content Management",
      icon: <FaEdit />,
      items: [
        { label: "Events", path: "/admin/events", icon: <FaCalendarAlt /> },
        { label: "Gallery", path: "/admin/gallery", icon: <FaImages /> },
        { label: "Videos", path: "/admin/videos", icon: <FaVideo /> },
        {
          label: "Announcements",
          path: "/admin/announcements",
          icon: <FaBullhorn />,
        },
      ],
    },
    {
      title: "Community Management",
      icon: <FaUsers />,
      items: [
        {
          label: "Volunteers",
          path: "/admin/volunteers",
          icon: <FaUserFriends />,
        },
        { label: "Settings", path: "/admin/settings", icon: <FaCog /> },
      ],
    },
  ];

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">Admin Dashboard</h1>
        <span className="admin-date">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: "4px solid #E87516" }}>
          <span className="stat-icon">
            <FaHands />
          </span>
          <span className="stat-value">
            ₹{stats.totalChanda.toLocaleString()}
          </span>
          <span className="stat-label">Total Chanda</span>
        </div>
        <div className="stat-card" style={{ borderTop: "4px solid #28a745" }}>
          <span className="stat-icon">
            <FaDonate />
          </span>
          <span className="stat-value">
            ₹{stats.totalDonations.toLocaleString()}
          </span>
          <span className="stat-label">Online Donations</span>
        </div>
        <div className="stat-card" style={{ borderTop: "4px solid #6B1E1E" }}>
          <span className="stat-icon">
            <FaMoneyBill />
          </span>
          <span className="stat-value">
            ₹{stats.totalExpenses.toLocaleString()}
          </span>
          <span className="stat-label">Total Expenses</span>
        </div>
        <div className="stat-card" style={{ borderTop: "4px solid #D4A017" }}>
          <span className="stat-icon">
            <FaWallet />
          </span>
          <span className="stat-value">₹{stats.balance.toLocaleString()}</span>
          <span className="stat-label">Balance</span>
        </div>
        <div className="stat-card" style={{ borderTop: "4px solid #17a2b8" }}>
          <span className="stat-icon">
            <FaCalendarAlt />
          </span>
          <span className="stat-value">{stats.eventCount}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="stat-card" style={{ borderTop: "4px solid #6f42c1" }}>
          <span className="stat-icon">
            <FaUsers />
          </span>
          <span className="stat-value">{stats.volunteerCount}</span>
          <span className="stat-label">Volunteers</span>
        </div>
        <div className="stat-card" style={{ borderTop: "4px solid #fd7e14" }}>
          <span className="stat-icon">
            <FaBullhorn />
          </span>
          <span className="stat-value">{stats.announcementCount}</span>
          <span className="stat-label">Announcements</span>
        </div>
        <div className="stat-card" style={{ borderTop: "4px solid #dc3545" }}>
          <span className="stat-icon">
            <FaClock />
          </span>
          <span className="stat-value">{stats.pendingDonations}</span>
          <span className="stat-label">Pending Donations</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h2>Quick Actions</h2>
        <div className="admin-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-btn"
              style={{ backgroundColor: action.color }}
              onClick={() => navigate(action.path)}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Sections */}
      <div className="admin-sections-grid">
        {adminSections.map((section, index) => (
          <div key={index} className="admin-section-card">
            <div className="section-header">
              <span className="section-icon">{section.icon}</span>
              <h3>{section.title}</h3>
            </div>
            <div className="section-items">
              {section.items.map((item, idx) => (
                <button
                  key={idx}
                  className="section-item"
                  onClick={() => navigate(item.path)}
                >
                  {item.icon} {item.label}
                  <FaArrowRight className="item-arrow" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="admin-section">
        <h2>Recent Activity</h2>
        <div className="recent-activity-grid">
          {/* Recent Chanda */}
          <div className="activity-card">
            <h3>
              <FaHands /> Recent Chanda
            </h3>
            {recentChanda.length === 0 ? (
              <p className="no-data">No Chanda entries</p>
            ) : (
              <ul>
                {recentChanda.map((entry) => (
                  <li key={entry._id}>
                    <span className="activity-name">{entry.name}</span>
                    <span className="activity-amount">₹{entry.amount}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="view-all-btn"
              onClick={() => navigate("/admin/chanda")}
            >
              View All <FaArrowRight />
            </button>
          </div>

          {/* Recent Donations */}
          <div className="activity-card">
            <h3>
              <FaDonate /> Recent Donations
            </h3>
            {recentDonations.length === 0 ? (
              <p className="no-data">No donations yet</p>
            ) : (
              <ul>
                {recentDonations.map((donation) => (
                  <li key={donation._id}>
                    <span className="activity-name">
                      {donation.isAnonymous ? "Anonymous" : donation.donorName}
                    </span>
                    <span className="activity-amount">₹{donation.amount}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="view-all-btn"
              onClick={() => navigate("/admin/donations")}
            >
              View All <FaArrowRight />
            </button>
          </div>

          {/* Recent Events */}
          <div className="activity-card">
            <h3>
              <FaCalendarAlt /> Upcoming Events
            </h3>
            {recentEvents.length === 0 ? (
              <p className="no-data">No events scheduled</p>
            ) : (
              <ul>
                {recentEvents.map((event) => (
                  <li key={event._id}>
                    <span className="activity-name">{event.name}</span>
                    <span className="activity-date">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="view-all-btn"
              onClick={() => navigate("/admin/events")}
            >
              View All <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
