import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/teacher/Sidebar";
import toast from "react-hot-toast";
import "../../styles/teacher/students.css";

export default function Students() {
  const { currentUser } = useAuth();

  const [students, setStudents] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Fetch students and attempts ──────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    async function fetchData() {
      try {
        // Fetch all students
        const studentQuery = query(
          collection(db, "users"),
          where("role", "==", "student")
        );
        const studentSnapshot = await getDocs(studentQuery);
        const studentData = studentSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Fetch all attempts for teacher quizzes
        const attemptQuery = query(
          collection(db, "attempts")
        );
        const attemptSnapshot = await getDocs(attemptQuery);
        const attemptData = attemptSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setStudents(studentData);
        setAttempts(attemptData);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load students.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  // ── Get student stats ────────────────────────────────────────
  function getStudentStats(studentId) {
    const studentAttempts = attempts.filter(
      (a) => a.studentId === studentId
    );

    if (studentAttempts.length === 0) {
      return {
        attempted: 0,
        passed: 0,
        avgScore: 0,
        bestScore: 0,
      };
    }

    const scores = studentAttempts.map((a) => a.percentage || 0);
    const passed = studentAttempts.filter((a) => a.passed).length;
    const avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
    const bestScore = Math.max(...scores);

    return {
      attempted: studentAttempts.length,
      passed,
      avgScore,
      bestScore,
    };
  }

  // ── Get status ───────────────────────────────────────────────
  function getStatus(avgScore, attempted) {
    if (attempted === 0) return { label: "No attempts", class: "average" };
    if (avgScore >= 75) return { label: "🌟 Doing great", class: "good" };
    if (avgScore >= 50) return { label: "📊 Average", class: "average" };
    return { label: "⚠️ Needs help", class: "needs-help" };
  }

  // ── Get avatar color ─────────────────────────────────────────
  function getAvatarClass(avgScore, attempted) {
    if (attempted === 0) return "mid";
    if (avgScore >= 75) return "";
    if (avgScore >= 50) return "mid";
    return "low";
  }

  // ── Get initials ─────────────────────────────────────────────
  function getInitials(name) {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  // ── Send alert to student ────────────────────────────────────
  function handleSendAlert(student) {
    toast.success(`Alert sent to ${student.name}!`);
  }

  // ── Filter students ──────────────────────────────────────────
  const filtered = students.filter((student) => {
    const stats = getStudentStats(student.id);
    

    // eslint-disable-next-line no-unused-vars

    // const status = getStatus(stats.avgScore, stats.attempted);

    const matchSearch =
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase());

    const matchGrade =
      filterGrade === "all" || student.grade === filterGrade;

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "good" && stats.avgScore >= 75) ||
      (filterStatus === "average" &&
        stats.avgScore >= 50 &&
        stats.avgScore < 75) ||
      (filterStatus === "needs-help" && stats.avgScore < 50);

    return matchSearch && matchGrade && matchStatus;
  });

  // ── Overall stats ────────────────────────────────────────────
  const totalStudents = students.length;
  const activeStudents = students.filter(
    (s) => getStudentStats(s.id).attempted > 0
  ).length;
  const needsHelp = students.filter(
    (s) => getStudentStats(s.id).avgScore < 50 &&
    getStudentStats(s.id).attempted > 0
  ).length;
  const avgClassScore =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => {
            const stats = getStudentStats(s.id);
            return sum + stats.avgScore;
          }, 0) / students.length
        )
      : 0;

  return (
    <div className="students-page">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="students-main">

        {/* Top Bar */}
        <div className="students-topbar">
          <div>
            <h1>👨‍🎓 Students</h1>
            <p>{filtered.length} students found</p>
          </div>
        </div>

        {/* Stats */}
        <div className="students-stats-grid">
          <div className="students-stat-card">
            <div className="students-stat-icon">👨‍🎓</div>
            <div className="students-stat-value">{totalStudents}</div>
            <div className="students-stat-label">Total Students</div>
          </div>
          <div className="students-stat-card">
            <div className="students-stat-icon">✅</div>
            <div className="students-stat-value">{activeStudents}</div>
            <div className="students-stat-label">Active Students</div>
          </div>
          <div className="students-stat-card">
            <div className="students-stat-icon">📊</div>
            <div className="students-stat-value">{avgClassScore}%</div>
            <div className="students-stat-label">Class Average</div>
          </div>
          <div className="students-stat-card">
            <div className="students-stat-icon">⚠️</div>
            <div className="students-stat-value">{needsHelp}</div>
            <div className="students-stat-label">Needs Help</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="students-toolbar">
          <input
            className="students-search"
            type="text"
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="students-filter"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="all">All Grades</option>
            {["6","7","8","9","10","11","12"].map((g) => (
              <option key={g} value={`Grade ${g}`}>
                Grade {g}
              </option>
            ))}
            <option value="University">University</option>
          </select>
          <select
            className="students-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="good">🌟 Doing great</option>
            <option value="average">📊 Average</option>
            <option value="needs-help">⚠️ Needs help</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="students-loading">
            ⏳ Loading students...
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="students-empty">
            <div className="students-empty-icon">📭</div>
            <h2>No students found</h2>
            <p>
              {search || filterGrade !== "all" || filterStatus !== "all"
                ? "Try changing your search or filters."
                : "No students have signed up yet."}
            </p>
          </div>
        )}

        {/* Students Grid */}
        {!loading && filtered.length > 0 && (
          <div className="students-grid">
            {filtered.map((student) => {
              const stats = getStudentStats(student.id);
              const status = getStatus(stats.avgScore, stats.attempted);
              const avatarClass = getAvatarClass(
                stats.avgScore,
                stats.attempted
              );

              return (
                <div className="student-card" key={student.id}>

                  {/* Header */}
                  <div className="student-card-header">
                    <div className={`student-card-avatar ${avatarClass}`}>
                      {getInitials(student.name)}
                    </div>
                    <div className="student-card-info">
                      <div className="student-card-name">
                        {student.name}
                      </div>
                      <div className="student-card-meta">
                        {student.grade} · Roll# {student.rollNumber || "N/A"}
                      </div>
                    </div>
                    <span className={`student-status-badge ${status.class}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="student-card-stats">
                    <div className="student-card-stat">
                      <div className="student-card-stat-value">
                        {stats.attempted}
                      </div>
                      <div className="student-card-stat-label">
                        Attempted
                      </div>
                    </div>
                    <div className="student-card-stat">
                      <div className="student-card-stat-value">
                        {stats.passed}
                      </div>
                      <div className="student-card-stat-label">
                        Passed
                      </div>
                    </div>
                    <div className="student-card-stat">
                      <div className="student-card-stat-value">
                        {stats.bestScore}%
                      </div>
                      <div className="student-card-stat-label">
                        Best
                      </div>
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="student-score-bar-wrap">
                    <div className="student-score-bar-label">
                      <span>Average Score</span>
                      <span>{stats.avgScore}%</span>
                    </div>
                    <div className="student-score-bar-bg">
                      <div
                        className="student-score-bar-fill"
                        style={{
                          width: `${stats.avgScore}%`,
                          background:
                            stats.avgScore >= 75
                              ? "#059669"
                              : stats.avgScore >= 50
                              ? "#d97706"
                              : "#dc2626",
                        }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    marginBottom: 14,
                  }}>
                    ✉️ {student.email}
                  </div>

                  {/* Actions */}
                  <div className="student-card-actions">
                    <button
                      className="btn-student-action btn-view-results"
                      onClick={() =>
                        toast.success(
                          `Viewing ${student.name}'s results`
                        )
                      }
                    >
                      📊 View Results
                    </button>
                    <button
                      className="btn-student-action btn-send-alert"
                      onClick={() => handleSendAlert(student)}
                    >
                      🔔 Send Alert
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}