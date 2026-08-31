import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSearch,
  FaImage,
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaTag,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Admin.css";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    location: "",
    type: "Other",
    status: "UPCOMING",
    isFeatured: false,
  });

  const eventTypes = ["Aarti", "Puja", "Cultural", "Food", "Ceremony", "Other"];
  const statuses = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.name || !formData.date || !formData.startTime) {
      toast.error("Name, date and start time are required");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("date", formData.date);
    formDataObj.append("startTime", formData.startTime);
    formDataObj.append("endTime", formData.endTime || "");
    formDataObj.append("description", formData.description || "");
    formDataObj.append("location", formData.location || "");
    formDataObj.append("type", formData.type);
    formDataObj.append("status", formData.status);
    formDataObj.append("isFeatured", formData.isFeatured);
    if (selectedFile) {
      formDataObj.append("image", selectedFile);
    }

    try {
      let response;
      if (editingEvent) {
        response = await api.put(`/events/${editingEvent._id}`, formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/events", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        await fetchEvents();
        toast.success(editingEvent ? "Event updated!" : "Event created!");
        setShowAddForm(false);
        setEditingEvent(null);
        setFormData({
          name: "",
          date: "",
          startTime: "",
          endTime: "",
          description: "",
          location: "",
          type: "Other",
          status: "UPCOMING",
          isFeatured: false,
        });
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save event");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter((e) => e._id !== id));
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/events/${id}/status`, {
        status: newStatus,
      });
      if (response.data.success) {
        setEvents(
          events.map((e) => (e._id === id ? { ...e, status: newStatus } : e)),
        );
        toast.success(`Event status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: new Date(event.date).toISOString().split("T")[0],
      startTime: event.startTime,
      endTime: event.endTime || "",
      description: event.description || "",
      location: event.location || "",
      type: event.type || "Other",
      status: event.status || "UPCOMING",
      isFeatured: event.isFeatured || false,
    });
    setShowAddForm(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      UPCOMING: { class: "status-upcoming", label: "Upcoming" },
      ONGOING: { class: "status-ongoing", label: "Ongoing" },
      COMPLETED: { class: "status-completed", label: "Completed" },
      CANCELLED: { class: "status-cancelled", label: "Cancelled" },
    };
    return badges[status] || badges["UPCOMING"];
  };

  const filteredEvents = events.filter((e) => {
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">📅 Event Management</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingEvent(null);
            setFormData({
              name: "",
              date: "",
              startTime: "",
              endTime: "",
              description: "",
              location: "",
              type: "Other",
              status: "UPCOMING",
              isFeatured: false,
            });
            setSelectedFile(null);
          }}
        >
          <FaPlus /> {showAddForm ? "Close" : "Add Event"}
        </button>
      </div>

      {showAddForm && (
        <div className="admin-form-card">
          <h3>{editingEvent ? "Edit Event" : "Create New Event"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Event Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter event name"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaCalendar /> Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <FaClock /> Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaClock /> End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaTag /> Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>
                <FaImage /> Event Image (Optional)
              </label>
              <input type="file" accept="image/*" onChange={handleFileSelect} />
              {editingEvent && editingEvent.image && (
                <div className="current-image">
                  <img src={editingEvent.image} alt="Current" />
                  <span>Current image</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                Feature this event
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingEvent ? <FaEdit /> : <FaPlus />}
                {editingEvent ? " Update Event" : " Create Event"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEvent(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
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
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? "active" : ""}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Event</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No events found
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => {
                const statusInfo = getStatusBadge(event.status);
                return (
                  <tr key={event._id}>
                    <td>
                      <span className="event-id">{event.eventId}</span>
                    </td>
                    <td>
                      <strong>{event.name}</strong>
                      {event.isFeatured && (
                        <span className="featured-star">⭐</span>
                      )}
                    </td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>
                      {event.startTime}
                      {event.endTime ? ` - ${event.endTime}` : ""}
                    </td>
                    <td>
                      <span className="type-badge">{event.type}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(event)}
                      >
                        <FaEdit />
                      </button>
                      <select
                        className="status-select"
                        value={event.status}
                        onChange={(e) =>
                          handleStatusChange(event._id, e.target.value)
                        }
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(event._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventManagement;
