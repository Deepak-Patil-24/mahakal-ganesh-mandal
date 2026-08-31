import React, { useState, useEffect, useRef } from "react";
import {
  FaChartBar,
  FaDownload,
  FaPrint,
  FaFilePdf,
  FaCalendarAlt,
  FaMoneyBill,
  FaHands,
  FaDonate,
  FaUsers,
  FaEye,
  FaArrowRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../utils/api";
import "./Reports.css";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [chanda, setChanda] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        donationsRes,
        expensesRes,
        chandaRes,
        eventsRes,
        volunteersRes,
        photosRes,
        videosRes,
        announcementsRes,
      ] = await Promise.all([
        api.get("/donations"),
        api.get("/expenses"),
        api.get("/chanda"),
        api.get("/events"),
        api.get("/volunteers"),
        api.get("/photos"),
        api.get("/videos"),
        api.get("/announcements"),
      ]);

      const allDonations = donationsRes.data.data || [];
      const allExpenses = expensesRes.data.data || [];
      const allChanda = chandaRes.data.data || [];
      const allEvents = eventsRes.data.data || [];
      const allVolunteers = volunteersRes.data.data || [];
      const allPhotos = photosRes.data.data || [];
      const allVideos = videosRes.data.data || [];
      const allAnnouncements = announcementsRes.data.data || [];

      setDonations(allDonations);
      setExpenses(allExpenses);
      setChanda(allChanda);
      setEvents(allEvents);
      setVolunteers(allVolunteers);
      setPhotos(allPhotos);
      setVideos(allVideos);
      setAnnouncements(allAnnouncements);

      // Extract years
      const years = new Set();
      allEvents.forEach((e) => years.add(new Date(e.date).getFullYear()));
      allPhotos.forEach((p) => years.add(p.year || new Date().getFullYear()));
      allVideos.forEach((v) => years.add(v.year || new Date().getFullYear()));
      allDonations.forEach((d) =>
        years.add(new Date(d.createdAt).getFullYear()),
      );
      allChanda.forEach((c) => years.add(new Date(c.createdAt).getFullYear()));

      const sortedYears = Array.from(years).sort((a, b) => b - a);
      if (sortedYears.length > 0) {
        setAvailableYears(sortedYears);
        setSelectedYear(sortedYears[0]);
      } else {
        setAvailableYears([new Date().getFullYear()]);
      }

      updateReportData(
        allDonations,
        allExpenses,
        allChanda,
        allEvents,
        allVolunteers,
        allPhotos,
        allVideos,
        allAnnouncements,
        sortedYears[0] || new Date().getFullYear(),
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const updateReportData = (
    donationsData,
    expensesData,
    chandaData,
    eventsData,
    volunteersData,
    photosData,
    videosData,
    announcementsData,
    year,
  ) => {
    // Filter by year
    const filteredDonations = donationsData.filter(
      (d) => new Date(d.createdAt).getFullYear() === year,
    );
    const filteredExpenses = expensesData.filter(
      (e) => new Date(e.date).getFullYear() === year,
    );
    const filteredChanda = chandaData.filter(
      (c) => new Date(c.createdAt).getFullYear() === year,
    );
    const filteredEvents = eventsData.filter(
      (e) => new Date(e.date).getFullYear() === year,
    );
    const filteredPhotos = photosData.filter(
      (p) => (p.year || new Date(p.createdAt).getFullYear()) === year,
    );
    const filteredVideos = videosData.filter(
      (v) => (v.year || new Date(v.createdAt).getFullYear()) === year,
    );

    const totalDonations = filteredDonations
      .filter((d) => d.status === "VERIFIED")
      .reduce((sum, d) => sum + d.amount, 0);

    const totalChanda = filteredChanda
      .filter((c) => c.status === "VERIFIED" || !c.status)
      .reduce((sum, c) => sum + c.amount, 0);

    const totalExpenses = filteredExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );

    const report = {
      year,
      generatedDate: new Date().toLocaleString(),
      summary: {
        totalDonations,
        totalChanda,
        totalExpenses,
        balance: totalDonations + totalChanda - totalExpenses,
        donorCount: filteredDonations.filter((d) => d.status === "VERIFIED")
          .length,
        chandaCount: filteredChanda.length,
        expenseCount: filteredExpenses.length,
        eventCount: filteredEvents.length,
        volunteerCount: volunteersData.length,
        photoCount: filteredPhotos.length,
        videoCount: filteredVideos.length,
        announcementCount: announcementsData.length,
      },
      donations: filteredDonations.filter((d) => d.status === "VERIFIED"),
      chanda: filteredChanda,
      expenses: filteredExpenses,
      events: filteredEvents,
      volunteers: volunteersData,
      photos: filteredPhotos,
      videos: filteredVideos,
      announcements: announcementsData,
    };

    setReportData(report);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    updateReportData(
      donations,
      expenses,
      chanda,
      events,
      volunteers,
      photos,
      videos,
      announcements,
      year,
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return "₹" + (amount || 0).toLocaleString();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  if (!reportData) {
    return <div className="loading">No data available</div>;
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="section-title">📊 Reports</h1>
        <div className="header-actions">
          <div className="year-selector">
            <label>Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={handlePrint}>
            <FaPrint /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Report */}
      <div ref={printRef} className="report-content" id="report-content">
        {/* Report Header */}
        <div className="report-header">
          <div className="report-title-section">
            <h1>MAHAKAL GANESH MANDAL</h1>
            <h2>KEB ROAD</h2>
            <h3>GANESH UTSAV {reportData.year}</h3>
            <h4>Final Report</h4>
            <p className="report-date">
              Generated on: {reportData.generatedDate}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="report-summary">
          <div className="summary-item">
            <span className="summary-label">Total Donations</span>
            <span className="summary-value">
              {formatCurrency(reportData.summary.totalDonations)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Chanda</span>
            <span className="summary-value">
              {formatCurrency(reportData.summary.totalChanda)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Expenses</span>
            <span className="summary-value">
              {formatCurrency(reportData.summary.totalExpenses)}
            </span>
          </div>
          <div className="summary-item highlight">
            <span className="summary-label">Balance</span>
            <span className="summary-value">
              {formatCurrency(reportData.summary.balance)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Donors</span>
            <span className="summary-value">
              {reportData.summary.donorCount}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Chanda Entries</span>
            <span className="summary-value">
              {reportData.summary.chandaCount}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Expenses</span>
            <span className="summary-value">
              {reportData.summary.expenseCount}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Events</span>
            <span className="summary-value">
              {reportData.summary.eventCount}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Volunteers</span>
            <span className="summary-value">
              {reportData.summary.volunteerCount}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Photos</span>
            <span className="summary-value">
              {reportData.summary.photoCount}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Videos</span>
            <span className="summary-value">
              {reportData.summary.videoCount}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Announcements</span>
            <span className="summary-value">
              {reportData.summary.announcementCount}
            </span>
          </div>
        </div>

        {/* Donations Section */}
        {reportData.donations.length > 0 && (
          <div className="report-section">
            <h3>Donations</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.donations.map((d) => (
                  <tr key={d._id}>
                    <td>{formatDate(d.createdAt)}</td>
                    <td>{d.isAnonymous ? "Anonymous" : d.donorName}</td>
                    <td>{formatCurrency(d.amount)}</td>
                    <td>{d.paymentMethod || "UPI"}</td>
                    <td>
                      <span className="status-verified">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="2">Total</th>
                  <th>
                    {formatCurrency(
                      reportData.donations.reduce((s, d) => s + d.amount, 0),
                    )}
                  </th>
                  <th colSpan="2"></th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Chanda Section */}
        {reportData.chanda.length > 0 && (
          <div className="report-section">
            <h3>Chanda</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {reportData.chanda.map((c) => (
                  <tr key={c._id}>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{formatCurrency(c.amount)}</td>
                    <td>{c.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3">Total</th>
                  <th>
                    {formatCurrency(
                      reportData.chanda.reduce((s, c) => s + c.amount, 0),
                    )}
                  </th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Expenses Section */}
        {reportData.expenses.length > 0 && (
          <div className="report-section">
            <h3>Expenses</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Expense</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.expenses.map((e) => (
                  <tr key={e._id}>
                    <td>{formatDate(e.date)}</td>
                    <td>{e.name}</td>
                    <td>{e.category}</td>
                    <td>{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3">Total</th>
                  <th>
                    {formatCurrency(
                      reportData.expenses.reduce((s, e) => s + e.amount, 0),
                    )}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Events Section */}
        {reportData.events.length > 0 && (
          <div className="report-section">
            <h3>Events</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.events.map((e) => (
                  <tr key={e._id}>
                    <td>{formatDate(e.date)}</td>
                    <td>{e.name}</td>
                    <td>{e.type}</td>
                    <td>{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Volunteers Section */}
        {reportData.volunteers.length > 0 && (
          <div className="report-section">
            <h3>Volunteers</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Area</th>
                  <th>Duty</th>
                </tr>
              </thead>
              <tbody>
                {reportData.volunteers.map((v) => (
                  <tr key={v._id}>
                    <td>{v.name}</td>
                    <td>{v.phone}</td>
                    <td>{v.area}</td>
                    <td>{v.duty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="report-footer">
          <p>
            This report is generated from the financial records maintained by
            Mahakal Ganesh Mandal, KEB Road.
          </p>
          <p className="report-footer-credit">🙏 Ganpati Bappa Morya</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
