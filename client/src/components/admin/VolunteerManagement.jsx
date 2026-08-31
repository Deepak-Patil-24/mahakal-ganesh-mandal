import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaMapMarkerAlt,
  FaImage,
  FaEdit,
  FaCheck,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Admin.css";

const VolunteerManagement = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    area: "General",
    duty: "General Assistance",
    notes: "",
  });

  const duties = [
    "Decoration",
    "Crowd Management",
    "Prasada",
    "Cleaning",
    "Security",
    "Cultural Programs",
    "General Assistance",
  ];

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await api.get("/volunteers/admin");
      setVolunteers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      toast.error("Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (!formData.name || !formData.phone) {
      toast.error("Name and phone are required");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("phone", formData.phone);
    formDataObj.append("email", formData.email || "");
    formDataObj.append("area", formData.area);
    formDataObj.append("duty", formData.duty);
    formDataObj.append("notes", formData.notes || "");
    if (selectedFile) {
      formDataObj.append("image", selectedFile);
    }

    try {
      let response;
      if (editingVolunteer) {
        response = await api.put(
          `/volunteers/${editingVolunteer._id}`,
          formDataObj,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        response = await api.post("/volunteers", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        await fetchVolunteers();
        toast.success(
          editingVolunteer
            ? "Volunteer updated!"
            : "Volunteer added successfully!",
        );
        setShowAddForm(false);
        setEditingVolunteer(null);
        setFormData({
          name: "",
          phone: "",
          email: "",
          area: "General",
          duty: "General Assistance",
          notes: "",
        });
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save volunteer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this volunteer?"))
      return;

    try {
      await api.delete(`/volunteers/${id}`);
      setVolunteers(volunteers.filter((v) => v._id !== id));
      toast.success("Volunteer deleted");
    } catch (error) {
      toast.error("Failed to delete volunteer");
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const response = await api.put(`/volunteers/${id}/status`, {
        isActive: !currentStatus,
      });
      if (response.data.success) {
        setVolunteers(
          volunteers.map((v) =>
            v._id === id ? { ...v, isActive: !currentStatus } : v,
          ),
        );
        toast.success(
          `Volunteer ${!currentStatus ? "activated" : "deactivated"}`,
        );
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (volunteer) => {
    setEditingVolunteer(volunteer);
    setFormData({
      name: volunteer.name,
      phone: volunteer.phone,
      email: volunteer.email || "",
      area: volunteer.area || "General",
      duty: volunteer.duty || "General Assistance",
      notes: volunteer.notes || "",
    });
    setShowAddForm(true);
  };

  const filteredVolunteers = volunteers.filter((v) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(s) ||
      v.phone.includes(s) ||
      v.duty.toLowerCase().includes(s)
    );
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">👥 Volunteer Management</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingVolunteer(null);
            setFormData({
              name: "",
              phone: "",
              email: "",
              area: "General",
              duty: "General Assistance",
              notes: "",
            });
            setSelectedFile(null);
          }}
        >
          <FaPlus /> {showAddForm ? "Close" : "Add Volunteer"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="admin-form-card">
          <h3>{editingVolunteer ? "Edit Volunteer" : "Add New Volunteer"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaUser /> Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter volunteer name"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <FaPhone /> Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaEnvelope /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email (optional)"
                />
              </div>
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt /> Area
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., Pandal Area, Main Gate"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaBriefcase /> Duty
                </label>
                <select
                  name="duty"
                  value={formData.duty}
                  onChange={handleChange}
                >
                  {duties.map((duty) => (
                    <option key={duty} value={duty}>
                      {duty}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <FaImage /> Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                {editingVolunteer && editingVolunteer.image && (
                  <div className="current-image">
                    <img src={editingVolunteer.image} alt="Current" />
                    <span>Current image</span>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingVolunteer ? <FaEdit /> : <FaPlus />}
                {editingVolunteer ? "Update Volunteer" : "Add Volunteer"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingVolunteer(null);
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
            placeholder="Search volunteers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-stats">
          <span>Total: {volunteers.length} volunteers</span>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Area</th>
              <th>Duty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVolunteers.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No volunteers found
                </td>
              </tr>
            ) : (
              filteredVolunteers.map((volunteer) => (
                <tr key={volunteer._id}>
                  <td>
                    <img
                      src={
                        volunteer.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(volunteer.name)}&background=E87516&color=fff&size=100`
                      }
                      alt={volunteer.name}
                      className="volunteer-thumb"
                    />
                  </td>
                  <td>
                    <strong>{volunteer.name}</strong>
                  </td>
                  <td>{volunteer.phone}</td>
                  <td>{volunteer.email || "-"}</td>
                  <td>{volunteer.area || "-"}</td>
                  <td>
                    <span className="duty-badge">{volunteer.duty}</span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${volunteer.isActive ? "status-verified" : "status-rejected"}`}
                    >
                      {volunteer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(volunteer)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`btn-status ${volunteer.isActive ? "btn-deactivate" : "btn-activate"}`}
                      onClick={() =>
                        handleStatusToggle(volunteer._id, volunteer.isActive)
                      }
                    >
                      {volunteer.isActive ? <FaTimes /> : <FaCheck />}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(volunteer._id)}
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

export default VolunteerManagement;
