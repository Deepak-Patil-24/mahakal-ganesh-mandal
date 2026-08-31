import React, { useState, useEffect } from "react";
import { FaUpload, FaQrcode, FaSave, FaEdit, FaLink } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Admin.css";

const Settings = () => {
  const [settings, setSettings] = useState({
    organizationName: "MAHAKAL GANESH MANDAL, KEB ROAD",
    tagline: "Ganpati Bappa Morya 🙏",
    qrCodeUrl: "",
    upiId: "",
    upiPayeeName: "MAHAKAL GANESH MANDAL",
    upiDeepLink: "",
    contactNumber: "+91 8431776329",
    pandalAddress: "KEB Road, [City]",
    aartiTimings: { morning: "6:00 AM", evening: "7:30 PM" },
    socialMedia: { facebook: "", instagram: "", youtube: "" },
  });
  const [loading, setLoading] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings");
      if (response.data.success && response.data.data) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setSettings((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put("/settings", settings);
      if (response.data.success) {
        toast.success("Settings saved successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUPISave = async () => {
    setLoading(true);
    try {
      const response = await api.put("/settings/upi", {
        upiId: settings.upiId,
        upiPayeeName: settings.upiPayeeName,
      });
      if (response.data.success) {
        setSettings(response.data.data);
        toast.success("UPI settings saved successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("UPI save error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save UPI settings",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("qrCode", file);

    setUploadingQR(true);
    try {
      const response = await api.post("/settings/upload-qr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setSettings((prev) => ({
          ...prev,
          qrCodeUrl: response.data.data.qrCodeUrl,
        }));
        toast.success("QR Code uploaded successfully!");
      }
    } catch (error) {
      toast.error("Failed to upload QR code");
    } finally {
      setUploadingQR(false);
      e.target.value = "";
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">⚙️ Settings</h1>
        <button
          className="btn-primary"
          onClick={() => setIsEditing(!isEditing)}
        >
          <FaEdit /> {isEditing ? "Cancel" : "Edit Settings"}
        </button>
      </div>

      {/* UPI Payment Link Section */}
      <div className="settings-section">
        <h2>
          <FaLink /> UPI Payment Link
        </h2>
        <div className="upi-settings">
          <div className="form-group">
            <label>UPI ID</label>
            <input
              type="text"
              name="upiId"
              value={settings.upiId || ""}
              onChange={handleChange}
              placeholder="e.g., mahakalganesh@upi or 9876543210@ybl"
              disabled={!isEditing}
            />
            <small>Your UPI ID for payments</small>
          </div>
          <div className="form-group">
            <label>Payee Name</label>
            <input
              type="text"
              name="upiPayeeName"
              value={settings.upiPayeeName || "MAHAKAL GANESH MANDAL"}
              onChange={handleChange}
              placeholder="Payee name for UPI"
              disabled={!isEditing}
            />
            <small>Name that appears in UPI app</small>
          </div>
          {settings.upiId && (
            <div className="upi-link-preview">
              <p>Payment Link:</p>
              <code
                className="upi-link"
                style={{
                  background: "#f5f5f5",
                  padding: "8px",
                  borderRadius: "4px",
                  display: "block",
                  wordBreak: "break-all",
                  fontSize: "12px",
                  color: "#333",
                }}
              >
                upi://pay?pa={settings.upiId}&pn=
                {encodeURIComponent(
                  settings.upiPayeeName || "MAHAKAL GANESH MANDAL",
                )}
                &cu=INR
              </code>
              <button
                className="btn-primary"
                onClick={() => {
                  const link = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiPayeeName || "MAHAKAL GANESH MANDAL")}&cu=INR`;
                  const isMobile = /Android|iPhone|iPad|iPod/i.test(
                    navigator.userAgent,
                  );
                  if (isMobile) {
                    window.location.href = link;
                  } else {
                    navigator.clipboard
                      .writeText(settings.upiId)
                      .then(() => {
                        toast.info(`UPI ID copied: ${settings.upiId}`);
                      })
                      .catch(() => {
                        toast.info(`UPI ID: ${settings.upiId}`);
                      });
                  }
                }}
                style={{ marginTop: "10px" }}
              >
                {/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                  ? "Test UPI Link"
                  : "Copy UPI ID"}
              </button>
            </div>
          )}
          {isEditing && (
            <button
              className="btn-primary"
              onClick={handleUPISave}
              disabled={loading}
              style={{ marginTop: "10px" }}
            >
              <FaSave /> {loading ? "Saving..." : "Save UPI Settings"}
            </button>
          )}
        </div>
      </div>

      {/* QR Code Upload Section */}
      <div className="settings-section">
        <h2>
          <FaQrcode /> QR Code Settings
        </h2>
        <div className="qr-settings">
          <div className="qr-preview">
            {settings.qrCodeUrl ? (
              <img
                src={settings.qrCodeUrl}
                alt="QR Code"
                className="qr-image-preview"
              />
            ) : (
              <div className="qr-placeholder">
                <FaQrcode size={64} />
                <p>No QR Code uploaded</p>
              </div>
            )}
          </div>
          <div className="qr-upload">
            <label className="upload-btn">
              <FaUpload /> Upload QR Code
              <input
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                disabled={uploadingQR}
                style={{ display: "none" }}
              />
            </label>
            {uploadingQR && <span className="upload-status">Uploading...</span>}
            <div className="form-group">
              <label>UPI ID (for display)</label>
              <input
                type="text"
                name="upiId"
                value={settings.upiId || ""}
                onChange={handleChange}
                placeholder="e.g., mahakalganesh@upi"
                disabled={!isEditing}
              />
              <small>Your UPI ID for QR payments</small>
            </div>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="settings-section">
        <h2>🏷️ General Settings</h2>
        <div className="settings-grid">
          <div className="form-group">
            <label>Organization Name</label>
            <input
              type="text"
              name="organizationName"
              value={settings.organizationName || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Tagline</label>
            <input
              type="text"
              name="tagline"
              value={settings.tagline || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={settings.contactNumber || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Pandal Address</label>
            <input
              type="text"
              name="pandalAddress"
              value={settings.pandalAddress || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Aarti Timings */}
      <div className="settings-section">
        <h2>🪔 Aarti Timings</h2>
        <div className="settings-grid">
          <div className="form-group">
            <label>Morning Aarti</label>
            <input
              type="text"
              name="aartiTimings.morning"
              value={settings.aartiTimings?.morning || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Evening Aarti</label>
            <input
              type="text"
              name="aartiTimings.evening"
              value={settings.aartiTimings?.evening || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="settings-section">
        <h2>📱 Social Media</h2>
        <div className="settings-grid">
          <div className="form-group">
            <label>Facebook</label>
            <input
              type="text"
              name="socialMedia.facebook"
              value={settings.socialMedia?.facebook || ""}
              onChange={handleChange}
              placeholder="https://facebook.com/yourpage"
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Instagram</label>
            <input
              type="text"
              name="socialMedia.instagram"
              value={settings.socialMedia?.instagram || ""}
              onChange={handleChange}
              placeholder="https://instagram.com/yourpage"
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>YouTube</label>
            <input
              type="text"
              name="socialMedia.youtube"
              value={settings.socialMedia?.youtube || ""}
              onChange={handleChange}
              placeholder="https://youtube.com/yourchannel"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="settings-actions">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            <FaSave /> {loading ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
