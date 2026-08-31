import React, { useState, useEffect } from "react";
import { FaBullhorn, FaCalendar, FaTag, FaEye } from "react-icons/fa";
import api from "../../utils/api";
import "./Pages.css";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/announcements/public?limit=20");
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "#28a745",
      Medium: "#ffc107",
      High: "#fd7e14",
      Urgent: "#dc3545",
    };
    return colors[priority] || "#6c757d";
  };

  if (loading) {
    return <div className="loading">Loading announcements...</div>;
  }

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">📢 Announcements</h1>
        <p className="section-subtitle">
          Stay updated with the latest news and updates
        </p>

        {announcements.length === 0 ? (
          <div className="no-announcements">
            <FaBullhorn size={64} />
            <h3>No announcements yet</h3>
            <p>Check back later for updates</p>
          </div>
        ) : (
          <div className="announcements-list">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="announcement-item">
                <div className="announcement-header">
                  <div className="announcement-meta">
                    <span
                      className={`announcement-type ${announcement.type.toLowerCase()}`}
                    >
                      {announcement.type || "General"}
                    </span>
                    <span
                      className="announcement-priority"
                      style={{
                        backgroundColor: getPriorityColor(
                          announcement.priority,
                        ),
                      }}
                    >
                      {announcement.priority || "Medium"}
                    </span>
                  </div>
                  <span className="announcement-date">
                    <FaCalendar />{" "}
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2>{announcement.title}</h2>
                <p className="announcement-content">{announcement.content}</p>
                {announcement.image && (
                  <div className="announcement-image">
                    <img src={announcement.image} alt={announcement.title} />
                  </div>
                )}
                <div className="announcement-footer">
                  <span className="announcement-views">
                    <FaEye /> {announcement.views || 0} views
                  </span>
                  {announcement.isFeatured && (
                    <span className="featured-badge">⭐ Featured</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
