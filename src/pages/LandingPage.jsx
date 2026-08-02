import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { currentUser, userRole } = useAuth();

  // Auto redirect if already logged in
  if (currentUser && userRole) {
    return (
      <Navigate
        to={userRole === "teacher" ? "/teacher/dashboard" : "/student/dashboard"}
        replace
      />
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚡</span>
          <span style={styles.logoText}>QuizCloud</span>
        </div>

        {/* Heading */}
        <h1 style={styles.heading}>
          The smarter way to quiz, learn, and grow
        </h1>
        <p style={styles.subheading}>
          Teachers create. Students learn. Results matter.
        </p>

        {/* Role Cards */}
        <div style={styles.cards}>

          {/* Teacher Card */}
          <div style={{ ...styles.card, ...styles.teacherCard }}>
            <div style={styles.cardIcon}>🎓</div>
            <h2 style={styles.cardTitle}>I'm a Teacher</h2>
            <p style={styles.cardDesc}>
              Create quizzes, manage students, and track
              performance with detailed analytics.
            </p>
            <div style={styles.cardActions}>
              <Link
                to="/teacher/signup"
                style={{ ...styles.btn, background: "#007BFF", color: "#fff" }}
              >
                Sign Up
              </Link>
              <Link
                to="/teacher/login"
                style={{ ...styles.btn, ...styles.btnOutline }}
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Student Card */}
          <div style={{ ...styles.card, ...styles.studentCard }}>
            <div style={styles.cardIcon}>📚</div>
            <h2 style={styles.cardTitle}>I'm a Student</h2>
            <p style={styles.cardDesc}>
              Attempt quizzes assigned by your teacher and
              review your results instantly.
            </p>
            <div style={styles.cardActions}>
              <Link
                to="/student/signup"
                style={{ ...styles.btn, background: "#28a745", color: "#fff" }}
              >
                Sign Up
              </Link>
              <Link
                to="/student/login"
                style={{ ...styles.btn, ...styles.btnOutline }}
              >
                Sign In
              </Link>
            </div>
          </div>

        </div>

        {/* Features Row */}
        <div style={styles.features}>
          <div style={styles.feature}>⚡ Real-time results</div>
          <div style={styles.feature}>🔒 Secure & private</div>
          <div style={styles.feature}>☁️ Cloud-based</div>
          <div style={styles.feature}>📊 Detailed analytics</div>
        </div>

        <p style={styles.footer}>
          Built with React & Firebase
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000000",
    padding: "24px 16px",
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
  },
  container: {
    maxWidth: 780,
    width: "100%",
    textAlign: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  logoIcon: { fontSize: 32 },
  logoText: {
    fontSize: 26,
    fontWeight: 700,
    color: "#FFFFFF",
    letterSpacing: "-0.5px",
  },
  heading: {
    fontSize: 36,
    fontWeight: 700,
    color: "#FFFFFF",
    marginBottom: 12,
    lineHeight: 1.25,
  },
  subheading: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 48,
  },
  cards: {
    display: "flex",
    gap: 24,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 40,
  },
  card: {
    background: "#1a1a1a",
    border: "0.5px solid #333333",
    borderRadius: 20,
    padding: "32px 28px",
    width: 300,
    textAlign: "left",
    boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
  },
  teacherCard: { borderTop: "4px solid #007BFF" },
  studentCard: { borderTop: "4px solid #28a745" },
  cardIcon: { fontSize: 36, marginBottom: 14 },
  cardTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 1.6,
    marginBottom: 24,
  },
  cardActions: { display: "flex", gap: 10 },
  btn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    transition: "opacity 0.15s",
  },
  btnOutline: {
    background: "transparent",
    border: "1px solid #333333",
    color: "#FFFFFF",
  },
  features: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  feature: {
    background: "#1a1a1a",
    border: "0.5px solid #333333",
    borderRadius: 20,
    padding: "6px 16px",
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: 500,
  },
  footer: {
    fontSize: 13,
    color: "#FFFFFF",
  },
};