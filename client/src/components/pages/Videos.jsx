import React, { useState, useEffect } from "react";
import {
  FaYoutube,
  FaCalendar,
  FaTag,
  FaPlay,
  FaSearch,
  FaEye,
  FaVideo,
  FaPause,
} from "react-icons/fa";
import api from "../../utils/api";
import "./Videos.css";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewRecorded, setViewRecorded] = useState({});
<<<<<<< HEAD
=======
  const iframeRef = useRef(null);

>>>>>>> 70d712a42b2b8774d8c53143a4d2614433b1c590

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/videos");

      if (response.data.success) {
        const videoData = response.data.data || [];
        setVideos(videoData);
        if (videoData.length > 0) {
          setSelectedVideo(videoData[0]);
        }
      } else {
        setError("Failed to load videos");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async (videoId) => {
    try {
      const response = await api.get(`/videos/${videoId}/view`);
      if (response.data.success) {
        setVideos((prevVideos) =>
          prevVideos.map((v) =>
            v._id === videoId ? { ...v, views: response.data.data.views } : v,
          ),
        );
        if (selectedVideo && selectedVideo._id === videoId) {
          setSelectedVideo((prev) => ({
            ...prev,
            views: response.data.data.views,
          }));
        }
        return true;
      }
    } catch (error) {
      console.error("Error incrementing view:", error);
    }
    return false;
  };

  const handleVideoSelect = async (video) => {
    setSelectedVideo(video);
    setIsPlaying(false);
  };

  const handlePlayClick = async () => {
    if (selectedVideo && !viewRecorded[selectedVideo._id]) {
      const success = await incrementView(selectedVideo._id);
      if (success) {
        setViewRecorded((prev) => ({
          ...prev,
          [selectedVideo._id]: true,
        }));
      }
      setIsPlaying(true);
    } else if (selectedVideo) {
      setIsPlaying(!isPlaying);
    }
  };

  const extractYouTubeId = (url) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url, autoPlay = false) => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1`;
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
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading">Loading videos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="error-message">
            <FaVideo size={48} />
            <h3>{error}</h3>
            <button className="btn-primary" onClick={fetchVideos}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">
          <FaVideo /> Videos
        </h1>
        <p className="section-subtitle">Watch our Ganesh Utsav celebrations</p>

        {/* Search */}
        <div className="videos-toolbar">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="video-count">
            <span>{filteredVideos.length} videos</span>
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="no-videos">
            <FaYoutube size={64} />
            <h3>No videos found</h3>
            <p>
              {search
                ? "Try adjusting your search"
                : "Check back later for more videos"}
            </p>
          </div>
        ) : (
          <div className="videos-layout">
            {/* Main Video Player */}
            <div className="main-video-player">
              {selectedVideo ? (
                <div className="video-player-wrapper">
                  <div className="video-container">
                    <iframe
                      src={getEmbedUrl(selectedVideo.url, isPlaying)}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="main-video-iframe"
                    ></iframe>
                    <div className="video-controls-overlay">
                      <button
                        className={`play-btn-overlay ${isPlaying ? "playing" : ""}`}
                        onClick={handlePlayClick}
                      >
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </button>
                    </div>
                  </div>
                  <div className="video-player-info">
                    <div className="video-title-section">
                      <h2>{selectedVideo.title}</h2>
                      <span className="view-count">
                        <FaEye /> {formatViews(selectedVideo.views || 0)}
                      </span>
                    </div>
                    {selectedVideo.description && (
                      <p>{selectedVideo.description}</p>
                    )}
                    <div className="video-player-meta">
                      <span>
                        <FaCalendar />{" "}
                        {selectedVideo.year || new Date().getFullYear()}
                      </span>
                      <span>
                        <FaTag /> {selectedVideo.event || "General"}
                      </span>
                      {isPlaying && (
                        <span className="playing-indicator">▶ Playing</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="video-placeholder-main">
                  <FaYoutube size={64} />
                  <p>Select a video to play</p>
                </div>
              )}
            </div>

            {/* Video Playlist */}
            <div className="video-playlist">
              <h3>Playlist</h3>
              <div className="playlist-items">
                {filteredVideos.map((video) => (
                  <div
                    key={video._id}
                    className={`playlist-item ${selectedVideo?._id === video._id ? "active" : ""}`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="playlist-thumbnail">
                      {video.videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                          alt={video.title}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="playlist-thumb-placeholder">
                          <FaYoutube size={24} />
                        </div>
                      )}
                      <div className="playlist-play-icon">
                        <FaPlay />
                      </div>
                      {selectedVideo?._id === video._id && isPlaying && (
                        <div className="playing-badge">▶</div>
                      )}
                    </div>
                    <div className="playlist-info">
                      <h4>{video.title}</h4>
                      <p>
                        {video.event || "General"} •{" "}
                        {video.year || new Date().getFullYear()}
                      </p>
                      <span className="playlist-views">
                        <FaEye /> {formatViews(video.views || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;
