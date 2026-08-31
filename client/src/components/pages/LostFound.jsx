import React from "react";
import "./Pages.css";

const LostFound = () => {
  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">🔍 Lost & Found</h1>
        <p className="section-subtitle">
          Report lost items or check found items
        </p>

        <div className="lostfound-grid">
          <div className="lostfound-card">
            <h3>Report Lost Item</h3>
            <form>
              <div className="form-group">
                <label>Item Name *</label>
                <input type="text" placeholder="What did you lose?" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Describe the item"></textarea>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="Where did you lose it?" />
              </div>
              <button className="btn-primary">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostFound;
