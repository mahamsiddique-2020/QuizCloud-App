import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../../styles/teacher/dashboard.css";

const navItems = [
  { icon: "📊", label: "Dashboard",     path: "/teacher/dashboard" },
  { icon: "📝", label: "My Quizzes",    path: "/teacher/quizzes" },
  { icon: "🗂️", label: "Question Bank", path: "/teacher/questions" },
  { icon: "👨‍🎓", label: "Students",      path: "/teacher/students" },
  { icon: "📈", label: "Results",       path: "/teacher/results" },
  { icon: "🔔", label: "Notifications", path: "/teacher/notifications" },
  { icon: "⚙️", label: "Settings",      path: "/teacher/settings" },
];

export default function Sidebar() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll only when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">⚡</span>
        <span className="sidebar-logo-text">QuizCloud</span>
        <button
          className="sidebar-close-btn"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="sidebar-user-name">{userProfile?.name || "Teacher"}</div>
        <div className="sidebar-user-role">
          {userProfile?.subject} · {userProfile?.school}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-bottom">
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Hamburger (mobile only) ── */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* ── Desktop sidebar ── */}
      <div className="sidebar-desktop">
        <div className="sidebar">{navContent}</div>
      </div>

      {/* ── Backdrop ── */}
      <div
        className={`sidebar-backdrop${mobileOpen ? " open" : ""}`}
        style={{ pointerEvents: mobileOpen ? "auto" : "none" }}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <div className={`sidebar-drawer${mobileOpen ? " open" : ""}`}>
        <div className="sidebar">{navContent}</div>
      </div>
    </>
  );
}