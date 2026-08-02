import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../../styles/student/studentdashboard.css";

const navItems = [
  { icon: "📊", label: "Dashboard",     path: "/student/dashboard" },
  { icon: "📝", label: "My Quizzes",    path: "/student/quizzes" },
  { icon: "📈", label: "My Results",    path: "/student/results" },
  { icon: "🏆", label: "Leaderboard",   path: "/student/leaderboard" },
  { icon: "🔔", label: "Notifications", path: "/student/notifications" },
  { icon: "⚙️", label: "Settings",      path: "/student/settings" },
];

export default function StudentSidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed. Try again.");
    }
  }

  const navContent = (
    <>
      {/* Logo */}
      <div className="student-sidebar-logo">
        <span className="student-sidebar-logo-icon">⚡</span>
        <span className="student-sidebar-logo-text">QuizCloud</span>
        <button
          className="student-sidebar-close-btn"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* User Info */}
      <div className="student-sidebar-user">
        <div className="student-sidebar-user-name">
          {userProfile?.name || "Student"}
        </div>
        <div className="student-sidebar-user-role">
          {userProfile?.grade} · Roll# {userProfile?.rollNumber || "N/A"}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="student-sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`student-nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="student-sidebar-bottom">
        <button className="btn-student-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger (mobile only) */}
      <button
        className="student-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Desktop sidebar */}
      <div className="student-sidebar-desktop">
        <div className="student-sidebar">{navContent}</div>
      </div>

      {/* Backdrop */}
      <div
        className={`student-sidebar-backdrop${mobileOpen ? " open" : ""}`}
        style={{ pointerEvents: mobileOpen ? "auto" : "none" }}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`student-sidebar-drawer${mobileOpen ? " open" : ""}`}>
        <div className="student-sidebar">{navContent}</div>
      </div>
    </>
  );
}