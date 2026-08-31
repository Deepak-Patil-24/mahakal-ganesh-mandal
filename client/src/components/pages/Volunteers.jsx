import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEnvelope,
} from "react-icons/fa";
import api from "../../utils/api";
import "./Pages.css";

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await api.get("/volunteers");
      setVolunteers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading volunteers...</div>;
  }

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">Our Volunteers</h1>
        <p className="section-subtitle">
          Dedicated individuals making this festival possible
        </p>

        {volunteers.length === 0 ? (
          <div className="no-volunteers">
            <p>No volunteers registered yet.</p>
          </div>
        ) : (
          <div className="volunteers-grid">
            {volunteers.map((volunteer) => (
              <div key={volunteer._id} className="volunteer-card">
                <img
                  src={
                    volunteer.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(volunteer.name)}&background=E87516&color=fff&size=200`
                  }
                  alt={volunteer.name}
                  className="volunteer-image"
                />
                <h3>{volunteer.name}</h3>
                <div className="volunteer-details">
                  <p>
                    <FaPhone /> {volunteer.phone}
                  </p>
                  {volunteer.email && (
                    <p>
                      <FaEnvelope /> {volunteer.email}
                    </p>
                  )}
                  <p>
                    <FaMapMarkerAlt /> {volunteer.area}
                  </p>
                  <p>
                    <FaBriefcase /> {volunteer.duty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Volunteers;
