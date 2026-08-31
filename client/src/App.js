import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import MobileBottomNav from "./components/common/MobileBottomNav";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Darshan from "./components/pages/Darshan";
import Events from "./components/pages/Events";
import Donate from "./components/pages/Donate";
import Transparency from "./components/pages/Transparency";
import Gallery from "./components/pages/Gallery";
import Videos from "./components/pages/Videos";
import Memories from "./components/pages/Memories";
import Announcements from "./components/pages/Announcements";
import Volunteers from "./components/pages/Volunteers";
import LostFound from "./components/pages/LostFound";
import VisitorInfo from "./components/pages/VisitorInfo";
import Contact from "./components/pages/Contact";
import AdminLogin from "./components/pages/AdminLogin";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import ChandaManagement from "./components/admin/ChandaManagement";
import DonationManagement from "./components/admin/DonationManagement";
import ExpenseManagement from "./components/admin/ExpenseManagement";
import EventManagement from "./components/admin/EventManagement";
import GalleryManagement from "./components/admin/GalleryManagement";
import VideoManagement from "./components/admin/VideoManagement";
import AnnouncementManagement from "./components/admin/AnnouncementManagement";
import VolunteerManagement from "./components/admin/VolunteerManagement";
import LostFoundManagement from "./components/admin/LostFoundManagement";
import FestivalYearManagement from "./components/admin/FestivalYearManagement";
import Reports from "./components/admin/Reports";
import Settings from "./components/admin/Settings";

function App() {
  const location = useLocation();

  // Show footer only on home page
  const showFooter = location.pathname === "/";

  // Check if current path is admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/darshan" element={<Darshan />} />
          <Route path="/events" element={<Events />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/visitor-info" element={<VisitorInfo />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chanda"
            element={
              <ProtectedRoute>
                <ChandaManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donations"
            element={
              <ProtectedRoute>
                <DonationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/expenses"
            element={
              <ProtectedRoute>
                <ExpenseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute>
                <EventManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute>
                <GalleryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/videos"
            element={
              <ProtectedRoute>
                <VideoManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute>
                <AnnouncementManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/volunteers"
            element={
              <ProtectedRoute>
                <VolunteerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/lost-found"
            element={
              <ProtectedRoute>
                <LostFoundManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/festival-years"
            element={
              <ProtectedRoute>
                <FestivalYearManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer - Only on home page */}
      {showFooter && <Footer />}

      <MobileBottomNav />
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;
