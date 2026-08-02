import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
// import { updatePassword, updateEmail } from "firebase/auth";
import { updatePassword } from "firebase/auth";
import { db, auth } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/teacher/Sidebar";
import toast from "react-hot-toast";
import "../../styles/settings.css";

export default function TeacherSettings() {
  const { currentUser, userProfile, logout } = useAuth();

  const [form, setForm] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    subject: userProfile?.subject || "",
    school: userProfile?.school || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [toggles, setToggles] = useState({
    emailNotifications: true,
    quizReminders: true,
    studentAlerts: true,
    autoGrade: true,
    shuffleDefault: false,
  });

  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleToggle(key) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ── Save Profile ─────────────────────────────────────────────
  async function handleSaveProfile() {
    if (!form.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        name: form.name,
        subject: form.subject,
        school: form.school,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  // ── Change Password ──────────────────────────────────────────
  async function handleChangePassword() {
    if (!form.newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await updatePassword(auth.currentUser, form.newPassword);
      toast.success("Password changed successfully!");
      setForm((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        toast.error("Please logout and login again to change password.");
      } else {
        toast.error("Failed to change password.");
      }
    } finally {
      setSavingPassword(false);
    }
  }

  // ── Delete Account ───────────────────────────────────────────
  async function handleDeleteAccount() {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete your account and all your quizzes!"
      )
    )
      return;

    try {
      await auth.currentUser.delete();
      toast.success("Account deleted.");
      logout();
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        toast.error("Please logout and login again to delete account.");
      } else {
        toast.error("Failed to delete account.");
      }
    }
  }

  // ── Get initials ─────────────────────────────────────────────
  function getInitials(name) {
    if (!name) return "T";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <div className="settings-page">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="settings-main">

        {/* Top Bar */}
        <div className="settings-topbar">
          <div>
            <h1>⚙️ Settings</h1>
            <p>Manage your account and preferences</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="settings-card">
          <div className="settings-card-title">
            👤 Profile Information
          </div>

          {/* Avatar */}
          <div className="settings-avatar-row">
            <div className="settings-avatar teacher">
              {getInitials(form.name)}
            </div>
            <div className="settings-avatar-info">
              <h3>{form.name}</h3>
              <p>🎓 Teacher · {form.subject}</p>
            </div>
          </div>

          {/* Form */}
          <div className="settings-form">
            <div className="settings-form-row">
              <div className="settings-form-group">
                <label className="settings-label">Full Name</label>
                <input
                  className="settings-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="settings-form-group">
                <label className="settings-label">Email Address</label>
                <input
                  className="settings-input"
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                />
              </div>
            </div>

            <div className="settings-form-row">
              <div className="settings-form-group">
                <label className="settings-label">Subject</label>
                <select
                  className="settings-input"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Biology</option>
                  <option>English</option>
                  <option>History</option>
                  <option>Computer Science</option>
                  <option>Geography</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="settings-form-group">
                <label className="settings-label">School / Institution</label>
                <input
                  className="settings-input"
                  type="text"
                  name="school"
                  value={form.school}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                className="btn-save-settings"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "💾 Save Profile"}
              </button>
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="settings-card">
          <div className="settings-card-title">
            🔒 Change Password
          </div>
          <div className="settings-form">
            <div className="settings-form-row">
              <div className="settings-form-group">
                <label className="settings-label">New Password</label>
                <input
                  className="settings-input"
                  type="password"
                  name="newPassword"
                  placeholder="Min. 6 characters"
                  value={form.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="settings-form-group">
                <label className="settings-label">Confirm Password</label>
                <input
                  className="settings-input"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat new password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <button
                className="btn-save-settings"
                onClick={handleChangePassword}
                disabled={savingPassword}
              >
                {savingPassword ? "Changing..." : "🔒 Change Password"}
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="settings-card">
          <div className="settings-card-title">
            🎛️ Preferences
          </div>

          {[
            {
              key: "emailNotifications",
              title: "Email Notifications",
              desc: "Receive email when students submit quizzes",
            },
            {
              key: "quizReminders",
              title: "Quiz Reminders",
              desc: "Get reminded before quiz deadlines",
            },
            {
              key: "studentAlerts",
              title: "Student Alerts",
              desc: "Alert when a student scores below 50%",
            },
            {
              key: "autoGrade",
              title: "Auto Grading",
              desc: "Automatically grade MCQ and True/False questions",
            },
            {
              key: "shuffleDefault",
              title: "Shuffle by Default",
              desc: "Shuffle questions by default in new quizzes",
            },
          ].map((item) => (
            <div className="settings-toggle-row" key={item.key}>
              <div className="settings-toggle-info">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={toggles[item.key]}
                  onChange={() => handleToggle(item.key)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="danger-zone">
          <div className="danger-zone-title">
            ⚠️ Danger Zone
          </div>
          <div className="danger-zone-row">
            <div className="danger-zone-info">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all data</p>
            </div>
            <button
              className="btn-danger"
              onClick={handleDeleteAccount}
            >
              🗑️ Delete Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}