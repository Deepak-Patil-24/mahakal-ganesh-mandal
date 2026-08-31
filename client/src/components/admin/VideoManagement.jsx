import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSearch, FaYoutube, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Admin.css";

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    year: new Date().getFullYear(),
    event: "General",
    type: "YOUTUBE",
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/videos");
      console.log("Admin videos response:", response.data);
      setVideos(response.data.data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const extractYouTubeId = (url) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.title || !formData.url) {
      toast.error("Title and URL are required");
      return;
    }

    // Validate YouTube URL
    const videoId = extractYouTubeId(formData.url);
    if (!videoId) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    try {
      const response = await api.post("/videos", {
        title: formData.title,
        url: formData.url,
        description: formData.description || "",
        year: formData.year || new Date().getFullYear(),
        event: formData.event || "General",
        type: formData.type || "YOUTUBE",
      });

      if (response.data.success) {
        await fetchVideos();
        toast.success("Video added successfully!");
        setShowAddModal(false);
        setFormData({
          title: "",
          url: "",
          description: "",
          year: new Date().getFullYear(),
          event: "General",
          type: "YOUTUBE",
        });
      }
    } catch (error) {
      console.error("Add video error:", error);
      toast.error(error.response?.data?.message || "Failed to add video");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await api.delete(`/videos/${id}`);
      setVideos(videos.filter((v) => v._id !== id));
      toast.success("Video deleted successfully");
    } catch (error) {
      toast.error("Failed to delete video");
    }
  };

  const getEmbedUrl = (url) => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const formatViews = (views) => {
    if (!views) return "0 views";
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M views";
    if (views >= 1000) return (views / 1000).toFixed(1) + "K views";
    return views + " views";
  };

  const filteredVideos = videos.filter((v) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      v.title.toLowerCase().includes(s) ||
      v.description?.toLowerCase().includes(s) ||
      v.event?.toLowerCase().includes(s)
    );
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">🎥 Video Management</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowAddModal(!showAddModal);
            setFormData({
              title: "",
              url: "",
              description: "",
              year: new Date().getFullYear(),
              event: "General",
              type: "YOUTUBE",
            });
          }}
        >
          <FaPlus /> {showAddModal ? "Close" : "Add Video"}
        </button>
      </div>

      {showAddModal && (
        <div className="admin-form-card">
          <h3>Add YouTube Video</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Video Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title"
                required
              />
            </div>
            <div className="form-group">
              <label>YouTube URL *</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                required
              />
              <small>
                Paste the YouTube video URL (e.g.,
                https://youtube.com/watch?v=xxxxx)
              </small>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Video description"
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Event</label>
                <input
                  type="text"
                  name="event"
                  value={formData.event}
                  onChange={handleChange}
                  placeholder="e.g., Aarti"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <FaPlus /> Add Video
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-stats">
          <span>Total Videos: {videos.length}</span>
        </div>
      </div>

      <div className="videos-grid-admin">
        {filteredVideos.length === 0 ? (
          <div className="no-data">No videos found</div>
        ) : (
          filteredVideos.map((video) => {
            const embedUrl = getEmbedUrl(video.url);
            return (
              <div key={video._id} className="video-card-admin">
                <div className="video-thumbnail-admin">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="video-iframe"
                    ></iframe>
                  ) : (
                    <div className="video-placeholder-admin">
                      <FaYoutube size={48} />
                      <p>Invalid URL</p>
                    </div>
                  )}
                </div>
                <div className="video-info-admin">
                  <h4>{video.title}</h4>
                  <p>{video.description}</p>
                  <div className="video-meta-admin">
                    <span>{video.year}</span>
                    <span>{video.event}</span>
                    <span className="view-count-admin">
                      <FaEye /> {formatViews(video.views || 0)}
                    </span>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(video._id)}
                      title="Delete video"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VideoManagement;
