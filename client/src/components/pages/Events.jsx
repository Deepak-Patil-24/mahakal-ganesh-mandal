import React, { useState, useEffect } from "react";
import {
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaTag,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import api from "../../utils/api";
import "./Pages.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      UPCOMING: "#28a745",
      ONGOING: "#ffc107",
      COMPLETED: "#6c757d",
      CANCELLED: "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  const getStatusIcon = (status) => {
    const icons = {
      UPCOMING: "🔔",
      ONGOING: "🔄",
      COMPLETED: "✅",
      CANCELLED: "❌",
    };
    return icons[status] || "📌";
  };

  const filteredEvents = events.filter((e) => {
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || e.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">📅 Events</h1>
        <p className="section-subtitle">
          Join us in celebrating Ganesh Utsav 2026
        </p>

        {/* Search and Filter */}
        <div className="events-toolbar">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              <FaFilter /> All
            </button>
            <button
              className={`filter-btn ${filter === "UPCOMING" ? "active" : ""}`}
              onClick={() => setFilter("UPCOMING")}
            >
              🔔 Upcoming
            </button>
            <button
              className={`filter-btn ${filter === "ONGOING" ? "active" : ""}`}
              onClick={() => setFilter("ONGOING")}
            >
              🔄 Ongoing
            </button>
            <button
              className={`filter-btn ${filter === "COMPLETED" ? "active" : ""}`}
              onClick={() => setFilter("COMPLETED")}
            >
              ✅ Completed
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h3>No events found</h3>
            <p>Check back later for upcoming events</p>
          </div>
        ) : (
          <div className="events-grid-modern">
            {filteredEvents.map((event) => (
              <div key={event._id} className="event-card-modern">
                <div className="event-card-header">
                  <div className="event-date-large">
                    <span className="event-day">
                      {new Date(event.date).getDate()}
                    </span>
                    <span className="event-month">
                      {new Date(event.date).toLocaleString("default", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div
                    className="event-status-badge"
                    style={{
                      backgroundColor: getStatusColor(event.status),
                      color: "white",
                    }}
                  >
                    {getStatusIcon(event.status)} {event.status}
                  </div>
                </div>
                <div className="event-card-body">
                  {event.image && (
                    <div className="event-image">
                      <img src={event.image} alt={event.name} />
                    </div>
                  )}
                  <h3 className="event-title">{event.name}</h3>
                  {event.isFeatured && (
                    <span className="featured-badge">⭐ Featured</span>
                  )}
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <div className="event-detail">
                      <FaClock />
                      <span>
                        {event.startTime}
                        {event.endTime ? ` - ${event.endTime}` : ""}
                      </span>
                    </div>
                    {event.location && (
                      <div className="event-detail">
                        <FaMapMarkerAlt />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="event-detail">
                      <FaTag />
                      <span>{event.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
