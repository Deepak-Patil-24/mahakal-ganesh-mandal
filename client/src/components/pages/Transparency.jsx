import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { FaMoneyBill, FaWallet, FaHands, FaChartBar } from "react-icons/fa";
=======
import {
  FaMoneyBill,
  FaWallet,
  FaHands,
} from "react-icons/fa";
>>>>>>> 70d712a42b2b8774d8c53143a4d2614433b1c590
import api from "../../utils/api";
import "./Pages.css";

const Transparency = () => {
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({
    totalDonations: 0,
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
      const [donationsRes, expensesRes] = await Promise.all([
        api.get("/donations/public"),
        api.get("/expenses/public"),
      ]);

      setExpenses(expensesRes.data.data || []);
      setTotals({
        totalDonations: donationsRes.data.totals?.totalDonations || 0,
        totalExpenses: expensesRes.data.total || 0,
        balance:
          (donationsRes.data.totals?.totalDonations || 0) -
          (expensesRes.data.total || 0),
        donorCount: donationsRes.data.totals?.donorCount || 0,
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
          Complete transparency of all donations and expenses
        </p>

        {/* Summary Cards */}
        <div className="transparency-summary">
          <div
            className="summary-card"
            style={{ borderTop: "4px solid #E87516" }}
          >
            <FaHands className="summary-icon" />
            <h3>Total Donations</h3>
            <span className="amount">
              ₹{totals.totalDonations?.toLocaleString() || "0"}
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

        {/* Expenses Table */}
        <div className="data-section">
          <h2>Expenses</h2>
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
      </div>
    </div>
  );
};

export default Transparency;
