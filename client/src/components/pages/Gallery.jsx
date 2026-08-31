import React, { useState, useEffect } from "react";
import {
  FaUpload,
  FaTrash,
  FaImages,
  FaEye,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import "./Pages.css";

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewCounts, setViewCounts] = useState({});
  const { isAuthenticated } = useAuth(); // Check if user is admin

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await api.get("/photos");
      setPhotos(response.data.data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast.error("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async (photoId) => {
    try {
      const response = await api.get(`/photos/${photoId}/view`);
      if (response.data.success) {
        const newViews = response.data.data.views;
        setViewCounts((prev) => ({
          ...prev,
          [photoId]: newViews,
        }));
        setPhotos((prevPhotos) =>
          prevPhotos.map((p) =>
            p._id === photoId ? { ...p, views: newViews } : p,
          ),
        );
        return true;
      }
    } catch (error) {
      console.error("Error incrementing view:", error);
      toast.error("Failed to update view count");
    }
    return false;
  };

  const handlePhotoClick = async (photo) => {
    setSelectedPhoto(photo);
    await incrementView(photo._id);
  };

  const handleCloseLightbox = () => {
    setSelectedPhoto(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a photo");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("caption", caption || "Ganesh Utsav 2026");

    try {
      const response = await api.post("/photos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotos([response.data.data, ...photos]);
      setSelectedFile(null);
      setCaption("");
      toast.success("Photo uploaded successfully!");
      document.getElementById("fileInput").value = "";
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
      toast.success("Photo deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const formatViews = (views) => {
    if (!views) return "0 views";
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M views";
    if (views >= 1000) return (views / 1000).toFixed(1) + "K views";
    return views + " views";
  };

  const filteredPhotos = photos.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(s) ||
      p.caption?.toLowerCase().includes(s) ||
      p.event?.toLowerCase().includes(s)
    );
  });

  if (loading) {
    return <div className="loading">Loading gallery...</div>;
  }

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">📸 Photo Gallery</h1>
        <p className="section-subtitle">Memories from Ganesh Utsav</p>

        {/* Upload Section - Only for Admin */}
        {isAuthenticated && (
          <div className="upload-section">
            <h3>
              <FaUpload /> Upload Photo
            </h3>
            <div className="upload-area">
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <button
                className="btn-secondary"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <FaImages /> Choose Photo
              </button>
              <input
                type="text"
                placeholder="Caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="caption-input"
              />
              <button
                className="btn-primary"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <FaUpload /> Upload
                  </>
                )}
              </button>
              {selectedFile && (
                <span className="file-name">Selected: {selectedFile.name}</span>
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="gallery-toolbar">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search photos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="photo-count">
            <span>{filteredPhotos.length} photos</span>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="empty-state">
            <FaImages size={64} />
            <h3>No photos found</h3>
            <p>Upload photos to start building the gallery</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredPhotos.map((photo) => (
              <div
                key={photo._id}
                className="gallery-item"
                onClick={() => handlePhotoClick(photo)}
              >
                <img src={photo.url} alt={photo.caption || photo.title} />
                <div className="gallery-item-overlay">
                  <p>{photo.caption || photo.title}</p>
                  <div className="gallery-item-meta">
                    <span>{photo.event || "General"}</span>
                    <span className="view-count-badge">
                      <FaEye /> {formatViews(photo.views || 0)}
                    </span>
                  </div>
                  {/* Delete button - Only for Admin */}
                  {isAuthenticated && (
                    <button
                      className="btn-delete-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo._id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {selectedPhoto && (
          <div className="lightbox-overlay" onClick={handleCloseLightbox}>
            <div
              className="lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={handleCloseLightbox}>
                <FaTimes />
              </button>
              <img src={selectedPhoto.url} alt={selectedPhoto.caption} />
              <div className="lightbox-info">
                <h3>{selectedPhoto.caption || selectedPhoto.title}</h3>
                <div className="lightbox-meta">
                  <span>{selectedPhoto.event || "General"}</span>
                  <span>{selectedPhoto.year || new Date().getFullYear()}</span>
                  <span className="view-count-lightbox">
                    <FaEye /> {formatViews(selectedPhoto.views || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
