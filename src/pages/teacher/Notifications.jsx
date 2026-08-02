import React, { useState, useEffect } from "react";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   updateDoc,
//   doc,
//   serverTimestamp,
// } from "firebase/firestore";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/teacher/Sidebar";
import toast from "react-hot-toast";
import "../../styles/notifications.css";

const NOTIF_TYPES = [
  { value: "quiz",    label: "📝 Quiz",    icon: "📝" },
  { value: "result",  label: "📊 Result",  icon: "📊" },
  { value: "warning", label: "⚠️ Warning", icon: "⚠️" },
  { value: "info",    label: "ℹ️ Info",    icon: "ℹ️" },
  { value: "success", label: "✅ Success", icon: "✅" },
];

export default function TeacherNotifications() {
  const { currentUser, userProfile } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("sent");
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info",
    audience: "all",
  });

  // ── Fetch notifications ──────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    async function fetchNotifications() {
      try {
        const q = query(
          collection(db, "notifications"),
          where("senderId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
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

  // ── Handle Form Change ───────────────────────────────────────
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── Send Notification ────────────────────────────────────────
  async function handleSend() {
    if (!form.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setSending(true);
    try {
      const notif = {
        title: form.title,
        message: form.message,
        type: form.type,
        audience: form.audience,
        senderId: currentUser.uid,
        senderName: userProfile.name,
        read: false,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "notifications"),
        notif
      );

      // Add to local state
      setNotifications((prev) => [
        { id: docRef.id, ...notif, createdAt: { seconds: Date.now() / 1000 } },
        ...prev,
      ]);

      toast.success("Notification sent successfully!");

      // Reset form
      setForm({
        title: "",
        message: "",
        type: "info",
        audience: "all",
      });

      // Switch to sent tab
      setTab("sent");

    } catch (err) {
      console.log(err);
      toast.error("Failed to send notification.");
    } finally {
      setSending(false);
    }
  }

  // ── Get time ago ─────────────────────────────────────────────
  function getTimeAgo(seconds) {
    if (!seconds) return "just now";
    const diff = Math.floor(Date.now() / 1000 - seconds);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // ── Get icon ─────────────────────────────────────────────────
  function getIcon(type) {
    return NOTIF_TYPES.find((t) => t.value === type)?.icon || "🔔";
  }

  return (
    <div className="notifications-page">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="notifications-main">

        {/* Top Bar */}
        <div className="notifications-topbar">
          <div>
            <h1>🔔 Notifications</h1>
            <p>Send announcements and alerts to students</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="notifications-tabs">
          <button
            className={`notifications-tab ${tab === "send" ? "active" : ""}`}
            onClick={() => setTab("send")}
          >
            ✉️ Send New
          </button>
          <button
            className={`notifications-tab ${tab === "sent" ? "active" : ""}`}
            onClick={() => setTab("sent")}
          >
            📤 Sent ({notifications.length})
          </button>
        </div>

        {/* Send Form */}
        {tab === "send" && (
          <div className="send-notification-card">
            <div className="send-notification-title">
              ✉️ Send New Notification
            </div>
            <div className="notification-form">

              {/* Title */}
              <input
                className="notification-input"
                type="text"
                name="title"
                placeholder="Notification title e.g. New Quiz Available!"
                value={form.title}
                onChange={handleChange}
              />

              {/* Message */}
              <textarea
                className="notification-input"
                name="message"
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
              />

              {/* Type + Audience */}
              <div className="notification-form-row">
                <div>
                  <label style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}>
                    Notification Type
                  </label>
                  <select
                    className="notification-input"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    {NOTIF_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}>
                    Send To
                  </label>
                  <select
                    className="notification-input"
                    name="audience"
                    value={form.audience}
                    onChange={handleChange}
                  >
                    <option value="all">All Students</option>
                    <option value="grade9">Grade 9</option>
                    <option value="grade10">Grade 10</option>
                    <option value="grade11">Grade 11</option>
                    <option value="grade12">Grade 12</option>
                  </select>
                </div>
              </div>

              {/* Send Button */}
              <button
                className="btn-send-notification"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? "Sending..." : "🔔 Send Notification"}
              </button>

            </div>
          </div>
        )}

        {/* Sent Notifications */}
        {tab === "sent" && (
          <>
            {loading && (
              <div className="notifications-empty">
                ⏳ Loading notifications...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="notifications-empty">
                <div className="notifications-empty-icon">📭</div>
                <h2>No notifications sent</h2>
                <p>Send your first notification to students!</p>
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <div className="notifications-list">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="notification-card"
                  >
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
                        📤 Sent to: {notif.audience === "all" ? "All Students" : notif.audience}
                        · {getTimeAgo(notif.createdAt?.seconds)}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}