import React, { useState, useEffect } from "react";
import { FaCalendar, FaImages, FaVideo, FaPlay, FaEye } from "react-icons/fa";
import api from "../../utils/api";
import "./Memories.css";

const Memories = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [photosRes, videosRes, eventsRes] = await Promise.all([
        api.get("/photos"),
        api.get("/videos"),
        api.get("/events"),
      ]);

      // Extract unique years from all data
      const allYears = new Set();

      photosRes.data.data.forEach((p) =>
        allYears.add(p.year || new Date().getFullYear()),
      );
      videosRes.data.data.forEach((v) =>
        allYears.add(v.year || new Date().getFullYear()),
      );
      eventsRes.data.data.forEach((e) =>
        allYears.add(new Date(e.date).getFullYear()),
      );

      const sortedYears = Array.from(allYears).sort((a, b) => b - a);
      setYears(sortedYears);

      setPhotos(photosRes.data.data || []);
      setVideos(videosRes.data.data || []);
      setEvents(eventsRes.data.data || []);

      if (sortedYears.length > 0) {
        setSelectedYear(sortedYears[0]);
      }
    } catch (error) {
      console.error("Error fetching memories data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getYearData = (year) => {
    const yearPhotos = photos.filter(
      (p) => (p.year || new Date().getFullYear()) === year,
    );
    const yearVideos = videos.filter(
      (v) => (v.year || new Date().getFullYear()) === year,
    );
    const yearEvents = events.filter(
      (e) => new Date(e.date).getFullYear() === year,
    );

    return { yearPhotos, yearVideos, yearEvents };
  };

  const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
    if (views >= 1000) return (views / 1000).toFixed(1) + "K";
    return views;
  };

  if (loading) {
    return <div className="memories-loading">Loading memories...</div>;
  }

  return (
    <div className="memories-page">
      <div className="container">
        <div className="memories-header">
          <h1 className="section-title">📖 Memories</h1>
          <p className="section-subtitle">
            Preserving the history of Jai Mahakal Ganesh Mandal
          </p>
        </div>

        {years.length === 0 ? (
          <div className="memories-empty">
            <div className="empty-icon">📸</div>
            <h3>No memories found</h3>
            <p>Start by uploading photos and videos!</p>
          </div>
        ) : (
          <>
            {/* Year Selection */}
            <div className="years-scroll">
              <div className="years-grid">
                {years.map((year) => (
                  <div
                    key={year}
                    className={`year-card ${selectedYear === year ? "active" : ""}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    <span className="year-number">{year}</span>
                    <span className="year-arrow">→</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Year Details */}
            {selectedYear && (
              <div className="year-details">
                {(() => {
                  const { yearPhotos, yearVideos, yearEvents } =
                    getYearData(selectedYear);
                  return (
                    <div className="year-content">
                      {/* Events Section */}
                      {yearEvents.length > 0 && (
                        <div className="memory-section">
                          <div className="section-header">
                            <FaCalendar className="section-icon" />
                            <h3>Events</h3>
                            <span className="section-count">
                              {yearEvents.length}
                            </span>
                          </div>
                          <div className="events-list">
                            {yearEvents.map((event) => (
                              <div key={event._id} className="event-item">
                                <div className="event-date-badge">
                                  <span className="event-day">
                                    {new Date(event.date).getDate()}
                                  </span>
                                  <span className="event-month">
                                    {new Date(event.date).toLocaleString(
                                      "default",
                                      { month: "short" },
                                    )}
                                  </span>
                                </div>
                                <div className="event-info">
                                  <h4>{event.name}</h4>
                                  <p>{event.description || "Event"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Photos Section */}
                      {yearPhotos.length > 0 && (
                        <div className="memory-section">
                          <div className="section-header">
                            <FaImages className="section-icon" />
                            <h3>Photos</h3>
                            <span className="section-count">
                              {yearPhotos.length}
                            </span>
                          </div>
                          <div className="photos-grid">
                            {yearPhotos.slice(0, 8).map((photo) => (
                              <div key={photo._id} className="photo-item">
                                <img
                                  src={photo.url}
                                  alt={photo.caption || "Memory"}
                                />
                                <div className="photo-overlay">
                                  <span className="photo-views">
                                    <FaEye /> {formatViews(photo.views || 0)}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {yearPhotos.length > 8 && (
                              <div className="photo-more">
                                <span>+{yearPhotos.length - 8} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Videos Section */}
                      {yearVideos.length > 0 && (
                        <div className="memory-section">
                          <div className="section-header">
                            <FaVideo className="section-icon" />
                            <h3>Videos</h3>
                            <span className="section-count">
                              {yearVideos.length}
                            </span>
                          </div>
                          <div className="videos-grid">
                            {yearVideos.slice(0, 6).map((video) => (
                              <div key={video._id} className="video-item">
                                <div className="video-thumb">
                                  {video.videoId ? (
                                    <img
                                      src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                      alt={video.title}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="video-thumb-placeholder">
                                      <FaVideo size={32} />
                                    </div>
                                  )}
                                  <div className="video-play-overlay">
                                    <FaPlay className="play-icon" />
                                  </div>
                                  <div className="video-views">
                                    <FaEye /> {formatViews(video.views || 0)}
                                  </div>
                                </div>
                                <h4>{video.title}</h4>
                                <p>{video.event || "General"}</p>
                              </div>
                            ))}
                            {yearVideos.length > 6 && (
                              <div className="video-more">
                                <span>+{yearVideos.length - 6} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {yearPhotos.length === 0 &&
                        yearVideos.length === 0 &&
                        yearEvents.length === 0 && (
                          <div className="no-content">
                            <span className="no-content-icon">📭</span>
                            <h4>No content for {selectedYear}</h4>
                            <p>Check back later for updates</p>
                          </div>
                        )}
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Memories;
