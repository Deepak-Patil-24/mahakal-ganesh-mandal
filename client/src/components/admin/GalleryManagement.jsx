import React, { useState, useEffect } from "react";
import { FaUpload, FaTrash, FaImages, FaPlus, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Admin.css";

const GalleryManagement = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    year: new Date().getFullYear(),
    event: "General",
  });

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await api.get("/photos");
      setPhotos(response.data.data);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files
    const invalidFiles = files.filter((f) => !f.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files");
      return;
    }

    if (files.length > 10) {
      toast.error("Maximum 10 photos at a time");
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select photos to upload");
      return;
    }

    setUploading(true);
    const formDataObj = new FormData();

    selectedFiles.forEach((file) => {
      formDataObj.append("photos", file);
    });
    formDataObj.append("title", formData.title || "Ganesh Utsav");
    formDataObj.append("caption", formData.caption || "");
    formDataObj.append("year", formData.year);
    formDataObj.append("event", formData.event);

    try {
      const response = await api.post("/photos/upload", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setPhotos([...response.data.data, ...photos]);
        toast.success(
          `${response.data.data.length} photos uploaded successfully!`,
        );
        setShowUploadModal(false);
        setSelectedFiles([]);
        setFormData({
          title: "",
          caption: "",
          year: new Date().getFullYear(),
          event: "General",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      await api.delete(`/photos/${id}`);
      setPhotos(photos.filter((p) => p._id !== id));
      toast.success("Photo deleted successfully");
    } catch (error) {
      toast.error("Failed to delete photo");
    }
  };

  if (loading) {
    return <div className="loading">Loading gallery...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">📸 Gallery Management</h1>
        <button
          className="btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          <FaPlus /> Upload Photos
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Upload Photos</h2>
              <button
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="upload-area">
                <label className="upload-drop-zone">
                  <FaImages size={48} />
                  <p>Click or drag photos here</p>
                  <span>Maximum 10 photos (5MB each)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                </label>
                {selectedFiles.length > 0 && (
                  <div className="selected-files">
                    <p>{selectedFiles.length} photos selected</p>
                    <ul>
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Album Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Ganesh Sthapana 2026"
                  />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Event</label>
                <input
                  type="text"
                  value={formData.event}
                  onChange={(e) =>
                    setFormData({ ...formData, event: e.target.value })
                  }
                  placeholder="e.g., Aarti, Cultural Program"
                />
              </div>
              <div className="form-group">
                <label>Caption (optional)</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                  placeholder="Add a caption"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
              >
                {uploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <FaUpload /> Upload Photos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {photos.length === 0 ? (
        <div className="empty-state">
          <FaImages size={64} />
          <h3>No photos uploaded yet</h3>
          <p>Click "Upload Photos" to add images to the gallery</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <div key={photo._id} className="gallery-item">
              <img src={photo.url} alt={photo.title} />
              <div className="gallery-item-overlay">
                <h4>{photo.title}</h4>
                <p>{photo.caption}</p>
                <span>
                  {photo.year} • {photo.event}
                </span>
                <button
                  className="btn-delete-small"
                  onClick={() => handleDelete(photo._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
