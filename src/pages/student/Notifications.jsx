import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "../../components/student/StudentSidebar";
import toast from "react-hot-toast";
import "../../styles/notifications.css";

export default function StudentNotifications() {
  // const { currentUser, userProfile } = useAuth();
  const { currentUser } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  // ── Fetch all notifications ──────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    async function fetchNotifications() {
      try {
        // Fetch all notifications
        const snapshot = await getDocs(
          collection(db, "notifications")
        );

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          // Check if this student has read it
          isRead: d.data().readBy?.includes(currentUser.uid) || false,
        }));

        // Sort by latest first
        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setNotifications(data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [currentUser]);

  // ── Mark as Read ─────────────────────────────────────────────
  async function markAsRead(notifId) {
    try {
      const notifRef = doc(db, "notifications", notifId);
      const notif = notifications.find((n) => n.id === notifId);

      if (notif?.isRead) return;

      const readBy = notif?.readBy || [];
      if (!readBy.includes(currentUser.uid)) {
        await updateDoc(notifRef, {
          readBy: [...readBy, currentUser.uid],
        });
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.log(err);
    }
  }

  // ── Mark All as Read ─────────────────────────────────────────
  async function markAllAsRead() {
    try {
      const unread = notifications.filter((n) => !n.isRead);

      for (const notif of unread) {
        const notifRef = doc(db, "notifications", notif.id);
        const readBy = notif?.readBy || [];
        if (!readBy.includes(currentUser.uid)) {
          await updateDoc(notifRef, {
            readBy: [...readBy, currentUser.uid],
          });
        }
      }

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      toast.success("All notifications marked as read!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to mark all as read.");
    }
  }

  // ── Get time ago ─────────────────────────────────────────────
  function getTimeAgo(seconds) {
    if (!seconds) return "just now";
    const diff = Math.floor(Date.now() / 1000 - seconds);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // ── Get icon ─────────────────────────────────────────────────
  function getIcon(type) {
    switch (type) {
      case "quiz":    return "📝";
      case "result":  return "📊";
      case "warning": return "⚠️";
      case "success": return "✅";
      default:        return "ℹ️";
    }
  }

  // ── Filter notifications ─────────────────────────────────────
  const filtered = notifications.filter((n) => {
    if (tab === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notifications-page">

      {/* Sidebar */}
      <StudentSidebar />

      {/* Main */}
      <div className="notifications-main">

        {/* Top Bar */}
        <div className="notifications-topbar">
          <div>
            <h1>🔔 Notifications</h1>
            <p>
              {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              className="btn-mark-all"
              onClick={markAllAsRead}
            >
              ✅ Mark all as read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="notifications-tabs">
          <button
            className={`notifications-tab ${
              tab === "all" ? "active student" : ""
            }`}
            onClick={() => setTab("all")}
          >
            All ({notifications.length})
          </button>
          <button
            className={`notifications-tab ${
              tab === "unread" ? "active student" : ""
            }`}
            onClick={() => setTab("unread")}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="notifications-empty">
            ⏳ Loading notifications...
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">📭</div>
            <h2>No notifications</h2>
            <p>
              {tab === "unread"
                ? "You have read all notifications!"
                : "No notifications from your teacher yet."}
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && filtered.length > 0 && (
          <div className="notifications-list">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                className={`notification-card ${
                  !notif.isRead ? "unread-student" : ""
                }`}
                onClick={() => markAsRead(notif.id)}
              >
                {/* Unread dot */}
                {!notif.isRead && (
                  <div className="unread-dot student" />
                )}

                {/* Icon */}
                <div className={`notification-icon ${notif.type}`}>
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="notification-content">
                  <div className="notification-title">
                    {notif.title}
                  </div>
                  <div className="notification-message">
                    {notif.message}
                  </div>
                  <div className="notification-time">
                    👨‍🏫 {notif.senderName}
                    · {getTimeAgo(notif.createdAt?.seconds)}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}