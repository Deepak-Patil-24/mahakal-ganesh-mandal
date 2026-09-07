import React, { useState, useEffect } from "react";
import { FaMoneyBill, FaWallet, FaHands, FaChartBar } from "react-icons/fa";
import api from "../../utils/api";
import "./Pages.css";

const Transparency = () => {
  const [chandaList, setChandaList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({
    totalChanda: 0,
    totalExpenses: 0,
    balance: 0,
    donorCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chandaRes, expensesRes] = await Promise.all([
        api.get("/chanda/public"),
        api.get("/expenses/public"),
      ]);

      setChandaList(chandaRes.data.data || []);
      setExpenses(expensesRes.data.data || []);
      setTotals({
        totalChanda: chandaRes.data.total || 0,
        totalExpenses: expensesRes.data.total || 0,
        balance: (chandaRes.data.total || 0) - (expensesRes.data.total || 0),
        donorCount: chandaRes.data.count || 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="section-title">
          <FaChartBar /> Financial Transparency
        </h1>
        <p className="section-subtitle">
          Complete transparency of all Chanda and expenses
        </p>

        {/* Summary Cards */}
        <div className="transparency-summary">
          <div
            className="summary-card"
            style={{ borderTop: "4px solid #E87516" }}
          >
            <FaHands className="summary-icon" />
            <h3>Total Chanda</h3>
            <span className="amount">
              ₹{totals.totalChanda?.toLocaleString() || "0"}
            </span>
            <small>{totals.donorCount || 0} donors</small>
          </div>
          <div
            className="summary-card"
            style={{ borderTop: "4px solid #6B1E1E" }}
          >
            <FaMoneyBill className="summary-icon" />
            <h3>Total Expenses</h3>
            <span className="amount">
              ₹{totals.totalExpenses?.toLocaleString() || "0"}
            </span>
            <small>{expenses.length} expenses</small>
          </div>
          <div
            className="summary-card"
            style={{ borderTop: "4px solid #D4A017" }}
          >
            <FaWallet className="summary-icon" />
            <h3>Balance</h3>
            <span className="amount">
              ₹{totals.balance?.toLocaleString() || "0"}
            </span>
            <small>Remaining balance</small>
          </div>
        </div>

        {/* Expenses Table - ABOVE Chanda */}
        <div className="data-section">
          <h2>
            <FaMoneyBill /> Expenses
          </h2>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Expense</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No expenses yet
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense._id || expense.id}>
                      <td>
                        {new Date(
                          expense.date || expense.createdAt,
                        ).toLocaleDateString()}
                      </td>
                      <td>{expense.name}</td>
                      <td>{expense.category}</td>
                      <td>₹{expense.amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chanda Table - BELOW Expenses */}
        <div className="data-section">
          <h2>
            <FaHands /> Chanda List
          </h2>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor Name</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {chandaList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No Chanda entries yet
                    </td>
                  </tr>
                ) : (
                  chandaList.map((entry) => (
                    <tr key={entry._id || entry.id}>
                      <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td>{entry.name}</td>
                      <td>₹{entry.amount.toLocaleString()}</td>
                      <td>
                        <span
                          className={`payment-badge ${entry.paymentMethod?.toLowerCase() || "cash"}`}
                        >
                          {entry.paymentMethod || "Cash"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transparency;
