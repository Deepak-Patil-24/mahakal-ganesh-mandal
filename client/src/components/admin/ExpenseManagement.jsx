import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Admin.css";

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const categories = [
    "Ganesh Idol",
    "Pandal",
    "Decoration",
    "Sound System",
    "Lighting",
    "Electricity",
    "Prasada/Food",
    "Cultural Programs",
    "Security",
    "Cleaning",
    "Transportation",
    "Immersion",
    "Other",
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/expenses");
      setExpenses(response.data.data || []);
      setTotalAmount(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
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
      toast.error("Please enter the expense name");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) < 1) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/expenses", {
        name: formData.name.trim(),
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date || new Date(),
        description: formData.description || "",
      });

      if (response.data.success) {
        setExpenses([response.data.data, ...expenses]);
        setTotalAmount((prev) => prev + parseFloat(formData.amount));
        setFormData({
          name: "",
          category: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
        });
        setShowAddForm(false);
        toast.success("Expense added successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      name: "",
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    try {
      const expense = expenses.find((e) => e._id === id);
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((e) => e._id !== id));
      if (expense) {
        setTotalAmount((prev) => prev - expense.amount);
      }
      toast.success("Expense deleted");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(searchLower) ||
      e.category.toLowerCase().includes(searchLower) ||
      e.expenseId?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="section-title">💰 Expense Management</h1>
        <div className="header-actions">
          <span className="total-amount">
            Total: ₹{totalAmount.toLocaleString()}
          </span>
          <button
            className="btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            type="button"
          >
            {showAddForm ? <FaTimes /> : <FaPlus />}
            {showAddForm ? "Close" : "Add Expense"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="admin-form-card">
          <h3>Add New Expense</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>Expense Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter expense name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Amount (₹) *</label>
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
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                disabled={isSubmitting}
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                <FaPlus /> {isSubmitting ? "Adding..." : "Add Expense"}
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

      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-stats">
          <span>Total Expenses: {expenses.length}</span>
        </div>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Expense Name</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No expenses found
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense._id}>
                  <td>
                    <span className="expense-id">{expense.expenseId}</span>
                  </td>
                  <td>
                    <strong>{expense.name}</strong>
                  </td>
                  <td>
                    <span className="category-badge">{expense.category}</span>
                  </td>
                  <td>
                    <strong>₹{expense.amount.toLocaleString()}</strong>
                  </td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.description || "-"}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(expense._id)}
                      type="button"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="expense-footer">
        <div className="footer-stats">
          <span>Total Expenses: ₹{totalAmount.toLocaleString()}</span>
          <span>Total Entries: {expenses.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;
