import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaUser,
  FaPhone,
  FaMoneyBill,
  FaWallet,
  FaSearch,
  FaTimes,
  FaCheck,
  FaQrcode,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Admin.css";

const ChandaManagement = () => {
  const [chandaList, setChandaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedChanda, setSelectedChanda] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    paymentMethod: "Cash",
    notes: "",
  });

  useEffect(() => {
    fetchChanda();
  }, []);

  const fetchChanda = async () => {
    try {
      setLoading(true);
      const response = await api.get("/chanda");
      setChandaList(response.data.data || []);
      setTotalAmount(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching Chanda:", error);
      toast.error("Failed to load Chanda data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.name.trim()) {
      toast.error("Please enter the donor name");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter the phone number");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) < 1) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/chanda", {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || "",
      });

      if (response.data.success) {
        setChandaList((prevList) => [response.data.data, ...prevList]);
        setTotalAmount((prev) => prev + parseFloat(formData.amount));

        setFormData({
          name: "",
          phone: "",
          amount: "",
          paymentMethod: "Cash",
          notes: "",
        });
        setShowAddForm(false);
        toast.success("Chanda added successfully! 🙏");
      }
    } catch (error) {
      console.error("Add Chanda error:", error);
      toast.error(error.response?.data?.message || "Failed to add Chanda");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      name: "",
      phone: "",
      amount: "",
      paymentMethod: "Cash",
      notes: "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Chanda entry?"))
      return;

    try {
      const chanda = chandaList.find((c) => c._id === id);
      await api.delete(`/chanda/${id}`);
      setChandaList(chandaList.filter((c) => c._id !== id));
      if (chanda) {
        setTotalAmount((prev) => prev - chanda.amount);
      }
      toast.success("Chanda entry deleted");
    } catch (error) {
      toast.error("Failed to delete Chanda entry");
    }
  };

  const openVerifyModal = (chanda) => {
    setSelectedChanda(chanda);
    setShowVerifyModal(true);
  };

  const handleVerifyQR = async () => {
    if (!selectedChanda) return;

    const { _id, upiTransactionId, name, amount } = selectedChanda;

    if (!upiTransactionId) {
      toast.error("No transaction ID found for this payment");
      setShowVerifyModal(false);
      return;
    }

    try {
      const response = await api.put(`/chanda/${_id}/verify`, {
        upiTransactionId,
      });
      if (response.data.success) {
        setChandaList(
          chandaList.map((c) =>
            c._id === _id ? { ...c, status: "VERIFIED" } : c,
          ),
        );
        toast.success(
          `✅ Chanda from ${name} (₹${amount}) verified successfully!`,
        );
        setShowVerifyModal(false);
        setSelectedChanda(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify Chanda");
    }
  };

  const handleRejectQR = async () => {
    if (!selectedChanda) return;

    if (
      !window.confirm(
        `⚠️ Reject this payment?\n\nName: ${selectedChanda.name}\nAmount: ₹${selectedChanda.amount}\nTransaction ID: ${selectedChanda.upiTransactionId}\n\nThis will mark the payment as REJECTED.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/chanda/${selectedChanda._id}`);
      setChandaList(chandaList.filter((c) => c._id !== selectedChanda._id));
      toast.warning(`Chanda from ${selectedChanda.name} rejected`);
      setShowVerifyModal(false);
      setSelectedChanda(null);
    } catch (error) {
      toast.error("Failed to reject Chanda");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "VERIFIED") {
      return { class: "status-verified", label: "✅ Verified" };
    } else if (status === "PENDING") {
      return { class: "status-pending", label: "⏳ Pending" };
    } else if (status === "REJECTED") {
      return { class: "status-rejected", label: "❌ Rejected" };
    }
    return { class: "status-pending", label: "⏳ Pending" };
  };

  const filteredChanda = chandaList.filter((c) => {
    if (filterStatus === "pending" && c.status !== "PENDING") return false;
    if (filterStatus === "verified" && c.status !== "VERIFIED") return false;
    if (filterStatus === "qr" && c.paymentMethod !== "QR Code") return false;

    if (search) {
      const searchLower = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(searchLower) ||
        c.phone.includes(search) ||
        c.chandaId?.toLowerCase().includes(searchLower) ||
        c.upiTransactionId?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const toggleForm = (e) => {
    if (e) e.preventDefault();
    setShowAddForm(!showAddForm);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">🙏 Chanda Management</h1>
        <div className="header-actions">
          <span className="total-amount">
            Total: ₹{totalAmount.toLocaleString()}
          </span>
          <button className="btn-primary" onClick={toggleForm} type="button">
            {showAddForm ? <FaTimes /> : <FaPlus />}
            {showAddForm ? "Close" : "Add Chanda"}
          </button>
        </div>
      </div>

      {/* Add Chanda Form */}
      {showAddForm && (
        <div className="admin-form-card">
          <h3>Add New Chanda Entry</h3>
          <form onSubmit={handleSubmit} noValidate>
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
                  placeholder="Enter donor name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>
                  <FaPhone /> Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaMoneyBill /> Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>
                  <FaWallet /> Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="QR Code">QR Code</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes"
                disabled={isSubmitting}
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                <FaPlus /> {isSubmitting ? "Adding..." : "Add Chanda"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name, phone, ID or Transaction ID..."
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
            className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            <FaClock /> Pending
          </button>
          <button
            className={`filter-btn ${filterStatus === "verified" ? "active" : ""}`}
            onClick={() => setFilterStatus("verified")}
          >
            <FaCheck /> Verified
          </button>
          <button
            className={`filter-btn ${filterStatus === "qr" ? "active" : ""}`}
            onClick={() => setFilterStatus("qr")}
          >
            <FaQrcode /> QR Payments
          </button>
        </div>
        <div className="filter-stats">
          <span>Total Entries: {chandaList.length}</span>
        </div>
      </div>

      {/* Chanda Table */}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredChanda.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No Chanda entries found
                </td>
              </tr>
            ) : (
              filteredChanda.map((entry) => {
                const statusInfo = getStatusBadge(entry.status);
                const isQRPayment = entry.paymentMethod === "QR Code";
                const isPending = entry.status === "PENDING";

                return (
                  <tr key={entry._id}>
                    <td>
                      <span className="chanda-id">{entry.chandaId}</span>
                    </td>
                    <td>
                      <strong>{entry.name}</strong>
                    </td>
                    <td>{entry.phone}</td>
                    <td>
                      <strong>₹{entry.amount.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span
                        className={`payment-badge ${entry.paymentMethod.toLowerCase()}`}
                      >
                        {entry.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      {entry.upiTransactionId ? (
                        <span
                          className="transaction-id-full"
                          title={entry.upiTransactionId}
                        >
                          <FaInfoCircle /> {entry.upiTransactionId}
                        </span>
                      ) : (
                        <span className="no-transaction">-</span>
                      )}
                    </td>
                    <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                    <td className="action-buttons">
                      {isQRPayment && isPending && (
                        <button
                          className="btn-verify"
                          onClick={() => openVerifyModal(entry)}
                          title="Verify this QR payment"
                        >
                          <FaCheck /> Verify
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(entry._id)}
                        type="button"
                        title="Delete entry"
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

      {/* Verify Modal */}
      {showVerifyModal && selectedChanda && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>🔍 Verify QR Payment</h2>
              <button
                className="modal-close"
                onClick={() => setShowVerifyModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="verify-details">
                <div className="verify-row">
                  <span className="verify-label">Name:</span>
                  <span className="verify-value">{selectedChanda.name}</span>
                </div>
                <div className="verify-row">
                  <span className="verify-label">Phone:</span>
                  <span className="verify-value">{selectedChanda.phone}</span>
                </div>
                <div className="verify-row">
                  <span className="verify-label">Amount:</span>
                  <span className="verify-value amount">
                    ₹{selectedChanda.amount.toLocaleString()}
                  </span>
                </div>
                <div className="verify-row">
                  <span className="verify-label">Transaction ID:</span>
                  <span className="verify-value transaction-id-value">
                    {selectedChanda.upiTransactionId}
                  </span>
                </div>
                <div className="verify-row">
                  <span className="verify-label">Date:</span>
                  <span className="verify-value">
                    {new Date(selectedChanda.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="verify-instructions">
                <h4>
                  <FaInfoCircle /> Verification Instructions:
                </h4>
                <ol>
                  <li>Open your bank account / UPI app</li>
                  <li>
                    Check for transaction ID:{" "}
                    <strong>{selectedChanda.upiTransactionId}</strong>
                  </li>
                  <li>
                    Verify the amount:{" "}
                    <strong>₹{selectedChanda.amount.toLocaleString()}</strong>
                  </li>
                  <li>Confirm the payment was received</li>
                </ol>
              </div>

              <div className="verify-actions">
                <button className="btn-verify-large" onClick={handleVerifyQR}>
                  <FaCheck /> ✅ Verify Payment
                </button>
                <button className="btn-reject-large" onClick={handleRejectQR}>
                  <FaTimes /> ❌ Reject Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="chanda-footer">
        <div className="footer-stats">
          <span>💰 Total: ₹{totalAmount.toLocaleString()}</span>
          <span>📋 Entries: {chandaList.length}</span>
          <span>
            ⏳ Pending:{" "}
            {chandaList.filter((c) => c.status === "PENDING").length}
          </span>
          <span>
            ✅ Verified:{" "}
            {chandaList.filter((c) => c.status === "VERIFIED").length}
          </span>
          <span>
            📱 QR:{" "}
            {chandaList.filter((c) => c.paymentMethod === "QR Code").length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChandaManagement;
