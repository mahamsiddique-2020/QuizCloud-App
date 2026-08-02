import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/teacher/Sidebar";
import "../../styles/teacher/dashboard.css";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeStudents: 0,
    avgScore: 0,
    pendingReviews: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch real data from Firebase ───────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    async function fetchDashboardData() {
      try {
        // 1. Fetch teacher's quizzes
        const quizQuery = query(
          collection(db, "quizzes"),
          where("teacherId", "==", currentUser.uid)
        );
        const quizSnapshot = await getDocs(quizQuery);
        const quizData = quizSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Sort latest first
        quizData.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        // 2. Fetch all attempts for teacher's quizzes
        const quizIds = quizData.map((q) => q.id);
        let allAttempts = [];

        if (quizIds.length > 0) {
          const attemptSnapshot = await getDocs(
            collection(db, "attempts")
          );
          allAttempts = attemptSnapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((a) => quizIds.includes(a.quizId));
        }

        // 3. Calculate stats
        const totalQuizzes = quizData.length;

        // Unique students
        const uniqueStudents = [
          ...new Set(allAttempts.map((a) => a.studentId)),
        ].length;

        // Average score
        const avgScore =
          allAttempts.length > 0
            ? Math.round(
                allAttempts.reduce(
                  (sum, a) => sum + (a.percentage || 0),
                  0
                ) / allAttempts.length
              )
            : 0;

        // Pending short answer reviews
        const pendingReviews = allAttempts.filter((a) => {
          const quiz = quizData.find((q) => q.id === a.quizId);
          return quiz?.questions?.some((q) => q.type === "short");
        }).length;

        setStats({
          totalQuizzes,
          activeStudents: uniqueStudents,
          avgScore,
          pendingReviews,
        });

        // 4. Recent quizzes — latest 4
        setRecentQuizzes(quizData.slice(0, 4));

        // 5. Build activity feed from attempts
        const activity = allAttempts
          .sort((a, b) => {
            const aTime = a.submittedAt?.seconds || 0;
            const bTime = b.submittedAt?.seconds || 0;
            return bTime - aTime;
          })
          .slice(0, 6)
          .map((attempt) => ({
            text: `${attempt.studentName} scored ${attempt.percentage}% in ${attempt.quizTitle}`,
            time: getTimeAgo(attempt.submittedAt?.seconds),
            color: attempt.passed ? "#059669" : "#dc2626",
          }));

        setRecentActivity(activity);

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentUser]);

  // ── Time ago helper ──────────────────────────────────────────
  function getTimeAgo(seconds) {
    if (!seconds) return "just now";
    const diff = Math.floor(Date.now() / 1000 - seconds);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // ── Badge helpers ────────────────────────────────────────────
  function getBadgeClass(status) {
    switch (status) {
      case "live":      return "quiz-badge badge-live";
      case "scheduled": return "quiz-badge badge-scheduled";
      case "draft":     return "quiz-badge badge-draft";
      case "closed":    return "quiz-badge badge-closed";
      default:          return "quiz-badge badge-draft";
    }
  }

  function getBadgeLabel(status) {
    switch (status) {
      case "live":      return "🟢 Live";
      case "scheduled": return "🕐 Scheduled";
      case "draft":     return "✏️ Draft";
      case "closed":    return "🔴 Closed";
      default:          return status;
    }
  }

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="dashboard-main">

        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div>
            <h1>Welcome back, {userProfile?.name?.split(" ")[0]} 👋</h1>
            <p>Here is what is happening with your quizzes today</p>
          </div>
          <div className="topbar-right">
            <button
              className="btn-new-quiz"
              onClick={() => navigate("/teacher/quizzes/create")}
            >
              + New Quiz
            </button>
          </div>
        </div>

        {/* Stats Cards — Real Data */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">📝</div>
            <div className="stat-card-value">{stats.totalQuizzes}</div>
            <div className="stat-card-label">Total Quizzes</div>
            <div className="stat-card-sub neutral">
              {loading ? "Loading..." : "your quizzes"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">👨‍🎓</div>
            <div className="stat-card-value">{stats.activeStudents}</div>
            <div className="stat-card-label">Active Students</div>
            <div className="stat-card-sub neutral">
              attempted quizzes
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">📊</div>
            <div className="stat-card-value">{stats.avgScore}%</div>
            <div className="stat-card-label">Average Score</div>
            <div className={`stat-card-sub ${stats.avgScore >= 70 ? "up" : "down"}`}>
              {stats.avgScore >= 70 ? "↑ Good performance" : "↓ Needs improvement"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">⏳</div>
            <div className="stat-card-value">{stats.pendingReviews}</div>
            <div className="stat-card-label">Pending Reviews</div>
            <div className="stat-card-sub neutral">short answers</div>
          </div>
        </div>

        {/* Recent Quizzes — Real Data */}
        <div className="dash-card" style={{ marginBottom: 20 }}>
          <div className="section-title">Recent Quizzes</div>
          {loading ? (
            <div style={{ color: "#6b7280", fontSize: 14 }}>
              ⏳ Loading...
            </div>
          ) : recentQuizzes.length === 0 ? (
            <div style={{ color: "#6b7280", fontSize: 14 }}>
              No quizzes yet.{" "}
              <span
                style={{ color: "#5b21b6", cursor: "pointer", fontWeight: 600 }}
                onClick={() => navigate("/teacher/quizzes/create")}
              >
                Create your first quiz →
              </span>
            </div>
          ) : (
            <div className="quiz-list">
              {recentQuizzes.map((quiz) => (
                <div className="quiz-item" key={quiz.id}>
                  <div
                    className="quiz-color-dot"
                    style={{ background: "#5b21b6" }}
                  />
                  <div className="quiz-item-info">
                    <div className="quiz-item-name">{quiz.title}</div>
                    <div className="quiz-item-meta">
                      {quiz.subject} · {quiz.grade} ·{" "}
                      {quiz.totalQuestions} questions · {quiz.timeLimit} min
                    </div>
                  </div>
                  <span className={getBadgeClass(quiz.status)}>
                    {getBadgeLabel(quiz.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed + Quick Info — Real Data */}
        <div className="two-col">

          {/* Activity Feed */}
          <div className="dash-card">
            <div className="section-title">Recent Activity</div>
            {loading ? (
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                ⏳ Loading...
              </div>
            ) : recentActivity.length === 0 ? (
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                No activity yet. Share your quizzes with students!
              </div>
            ) : (
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div className="activity-item" key={index}>
                    <div
                      className="activity-dot"
                      style={{ background: activity.color }}
                    />
                    <span className="activity-text">{activity.text}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="dash-card">
            <div className="section-title">Quick Info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={infoRow}>
                <span style={infoLabel}>Your Subject</span>
                <span style={infoValue}>{userProfile?.subject}</span>
              </div>
              <div style={infoRow}>
                <span style={infoLabel}>School</span>
                <span style={infoValue}>{userProfile?.school}</span>
              </div>
              <div style={infoRow}>
                <span style={infoLabel}>Email</span>
                <span style={infoValue}>{userProfile?.email}</span>
              </div>
              <div style={infoRow}>
                <span style={infoLabel}>Role</span>
                <span style={{
                  ...infoValue,
                  background: "#ede9fe",
                  color: "#5b21b6",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  Teacher
                </span>
              </div>
              <div style={infoRow}>
                <span style={infoLabel}>Total Quizzes</span>
                <span style={infoValue}>{stats.totalQuizzes}</span>
              </div>
              <div style={infoRow}>
                <span style={infoLabel}>Total Attempts</span>
                <span style={infoValue}>{stats.activeStudents} students</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

const infoRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "0.5px solid #f3f4f6",
};

const infoLabel = {
  fontSize: 13,
  color: "#6b7280",
};

const infoValue = {
  fontSize: 13,
  fontWeight: 500,
  color: "#FFFFFF",
};