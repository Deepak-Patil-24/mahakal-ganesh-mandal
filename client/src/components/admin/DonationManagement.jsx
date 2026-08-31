import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTrash,
  FaSearch,
  FaClock,
  FaEye,
  FaWallet,
  FaRupeeSign,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Admin.css";

const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/donations");
      setDonations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm("Verify this donation?")) return;

    try {
      const response = await api.put(`/donations/${id}/verify`);
      if (response.data.success) {
        setDonations(
          donations.map((d) =>
            d._id === id ? { ...d, status: "VERIFIED" } : d,
          ),
        );
        toast.success("Donation verified successfully!");
      }
    } catch (error) {
      toast.error("Failed to verify donation");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?"))
      return;

    try {
      await api.delete(`/donations/${id}`);
      setDonations(donations.filter((d) => d._id !== id));
      toast.success("Donation deleted");
    } catch (error) {
      toast.error("Failed to delete donation");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { class: "status-pending", label: "⏳ Pending" },
      VERIFIED: { class: "status-verified", label: "✅ Verified" },
      REJECTED: { class: "status-rejected", label: "❌ Rejected" },
      FAILED: { class: "status-rejected", label: "❌ Failed" },
    };
    return badges[status] || badges["PENDING"];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredDonations = donations.filter((d) => {
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        d.donorName?.toLowerCase().includes(s) ||
        d.donationId?.toLowerCase().includes(s) ||
        d.paymentId?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalVerified = donations
    .filter((d) => d.status === "VERIFIED")
    .reduce((sum, d) => sum + d.amount, 0);
  const totalPending = donations
    .filter((d) => d.status === "PENDING")
    .reduce((sum, d) => sum + d.amount, 0);

  if (loading) {
    return <div className="loading">Loading donations...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">💸 Donation Management</h1>
        <div className="header-stats">
          <span className="stat-badge verified">
            <FaCheck /> Verified: ₹{totalVerified.toLocaleString()}
          </span>
          <span className="stat-badge pending">
            <FaClock /> Pending: ₹{totalPending.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name, ID or payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterStatus === "PENDING" ? "active" : ""}`}
            onClick={() => setFilterStatus("PENDING")}
          >
            <FaClock /> Pending
          </button>
          <button
            className={`filter-btn ${filterStatus === "VERIFIED" ? "active" : ""}`}
            onClick={() => setFilterStatus("VERIFIED")}
          >
            <FaCheck /> Verified
          </button>
        </div>
      </div>

      {/* Donations Table */}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Donor Name</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Payment ID</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonations.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No donations found
                </td>
              </tr>
            ) : (
              filteredDonations.map((donation) => {
                const statusInfo = getStatusBadge(donation.status);
                const isPending = donation.status === "PENDING";

                return (
                  <tr key={donation._id}>
                    <td>
                      <span className="donation-id">{donation.donationId}</span>
                    </td>
                    <td>
                      {donation.isAnonymous ? "Anonymous" : donation.donorName}
                      {donation.isAnonymous && (
                        <span className="anonymous-badge">🔒</span>
                      )}
                    </td>
                    <td>
                      <strong>₹{donation.amount.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span
                        className={`payment-method ${donation.paymentMethod?.toLowerCase() || "upi"}`}
                      >
                        {donation.paymentMethod || "UPI"}
                      </span>
                    </td>
                    <td>
                      {donation.paymentId ? (
                        <span className="payment-id" title={donation.paymentId}>
                          {donation.paymentId.substring(0, 15)}...
                        </span>
                      ) : (
                        <span className="no-payment">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>{formatDate(donation.createdAt)}</td>
                    <td className="action-buttons">
                      {isPending && (
                        <button
                          className="btn-verify"
                          onClick={() => handleVerify(donation._id)}
                        >
                          <FaCheck /> Verify
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(donation._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="donation-stats">
        <div className="stats-item">
          <span className="stats-label">Total Donations</span>
          <span className="stats-value">{donations.length}</span>
        </div>
        <div className="stats-item">
          <span className="stats-label">Verified Donations</span>
          <span className="stats-value">
            {donations.filter((d) => d.status === "VERIFIED").length}
          </span>
        </div>
        <div className="stats-item">
          <span className="stats-label">Pending Donations</span>
          <span className="stats-value">
            {donations.filter((d) => d.status === "PENDING").length}
          </span>
        </div>
        <div className="stats-item">
          <span className="stats-label">Total Amount</span>
          <span className="stats-value">
            ₹{donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DonationManagement;
