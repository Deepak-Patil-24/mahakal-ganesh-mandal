import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaImage,
  FaBullhorn,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Admin.css";

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "General",
    priority: "Medium",
    isPublished: true,
    isFeatured: false,
    expiresAt: "",
  });

  const types = [
    "General",
    "Emergency",
    "Event Update",
    "Schedule Change",
    "Urgent",
  ];
  const priorities = ["Low", "Medium", "High", "Urgent"];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/announcements");
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
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

    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("content", formData.content);
    formDataObj.append("type", formData.type);
    formDataObj.append("priority", formData.priority);
    formDataObj.append("isPublished", formData.isPublished);
    formDataObj.append("isFeatured", formData.isFeatured);
    if (formData.expiresAt) {
      formDataObj.append("expiresAt", formData.expiresAt);
    }
    if (selectedFile) {
      formDataObj.append("image", selectedFile);
    }

    try {
      let response;
      if (editingAnnouncement) {
        response = await api.put(
          `/announcements/${editingAnnouncement._id}`,
          formDataObj,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        response = await api.post("/announcements", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        await fetchAnnouncements();
        toast.success(
          editingAnnouncement
            ? "Announcement updated!"
            : "Announcement created!",
        );
        setShowAddForm(false);
        setEditingAnnouncement(null);
        setFormData({
          title: "",
          content: "",
          type: "General",
          priority: "Medium",
          isPublished: true,
          isFeatured: false,
          expiresAt: "",
        });
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save announcement",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;

    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter((a) => a._id !== id));
      toast.success("Announcement deleted");
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const response = await api.put(`/announcements/${id}/toggle-publish`);
      if (response.data.success) {
        setAnnouncements(
          announcements.map((a) =>
            a._id === id ? { ...a, isPublished: !a.isPublished } : a,
          ),
        );
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to toggle publish status");
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type || "General",
      priority: announcement.priority || "Medium",
      isPublished: announcement.isPublished,
      isFeatured: announcement.isFeatured || false,
      expiresAt: announcement.expiresAt
        ? new Date(announcement.expiresAt).toISOString().split("T")[0]
        : "",
    });
    setShowAddForm(true);
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(s) ||
      a.content.toLowerCase().includes(s) ||
      a.type.toLowerCase().includes(s)
    );
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">📢 Announcement Management</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingAnnouncement(null);
            setFormData({
              title: "",
              content: "",
              type: "General",
              priority: "Medium",
              isPublished: true,
              isFeatured: false,
              expiresAt: "",
            });
            setSelectedFile(null);
          }}
        >
          <FaPlus /> {showAddForm ? "Close" : "Add Announcement"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="admin-form-card">
          <h3>
            {editingAnnouncement
              ? "Edit Announcement"
              : "Create New Announcement"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div className="form-group">
              <label>Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter announcement content"
                rows="4"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                  />
                  Publish immediately
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  Feature this announcement
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Expires At (Optional)</label>
              <input
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>
                <FaImage /> Image (Optional)
              </label>
              <input type="file" accept="image/*" onChange={handleFileSelect} />
              {editingAnnouncement && editingAnnouncement.image && (
                <div className="current-image">
                  <img src={editingAnnouncement.image} alt="Current" />
                  <span>Current image</span>
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingAnnouncement ? <FaEdit /> : <FaPlus />}
                {editingAnnouncement
                  ? " Update Announcement"
                  : " Create Announcement"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAnnouncement(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-stats">
          <span>Total: {announcements.length} announcements</span>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Views</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnnouncements.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  <FaBullhorn size={40} />
                  <p>No announcements found</p>
                  <p className="sub-text">
                    Click "Add Announcement" to create one
                  </p>
                </td>
              </tr>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <tr key={announcement._id}>
                  <td>
                    <span className="announcement-id">
                      {announcement.announcementId}
                    </span>
                  </td>
                  <td>
                    <strong>{announcement.title}</strong>
                  </td>
                  <td>
                    <span
                      className={`type-badge ${announcement.type.toLowerCase()}`}
                    >
                      {announcement.type}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`priority-badge ${announcement.priority.toLowerCase()}`}
                    >
                      {announcement.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${announcement.isPublished ? "status-verified" : "status-rejected"}`}
                    >
                      {announcement.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{announcement.views || 0}</td>
                  <td>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(announcement)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`btn-status ${announcement.isPublished ? "btn-deactivate" : "btn-activate"}`}
                      onClick={() => handleTogglePublish(announcement._id)}
                    >
                      {announcement.isPublished ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(announcement._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnnouncementManagement;
