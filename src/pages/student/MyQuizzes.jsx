import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "../../components/student/StudentSidebar";
import toast from "react-hot-toast";
import "../../styles/student/studentdashboard.css";

export default function StudentMyQuizzes() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [attemptedIds, setAttemptedIds] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ── Fetch quizzes and attempts ───────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    async function fetchData() {
      try {
        // Fetch all live quizzes
        const quizQuery = query(
          collection(db, "quizzes"),
          where("status", "==", "live")
        );
        const quizSnapshot = await getDocs(quizQuery);
        const quizData = quizSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setQuizzes(quizData);

        // Fetch student attempts
        const attemptQuery = query(
          collection(db, "attempts"),
          where("studentId", "==", currentUser.uid)
        );
        const attemptSnapshot = await getDocs(attemptQuery);
        const attemptData = attemptSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAttempts(attemptData);
        setAttemptedIds(attemptData.map((a) => a.quizId));

      } catch (err) {
        console.log(err);
        toast.error("Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  // ── Get attempt for a quiz ───────────────────────────────────
  function getAttempt(quizId) {
    return attempts.find((a) => a.quizId === quizId);
  }

  // ── Filter quizzes ───────────────────────────────────────────
  const filtered = quizzes.filter((quiz) => {
    const isAttempted = attemptedIds.includes(quiz.id);
    const matchSearch = quiz.title
      .toLowerCase()
      .includes(search.toLowerCase());

    if (filter === "pending")  return !isAttempted && matchSearch;
    if (filter === "attempted") return isAttempted && matchSearch;
    return matchSearch;
  });

  return (
    <div className="student-layout">

      {/* Sidebar */}
      <StudentSidebar />

      {/* Main */}
      <div className="student-main">

        {/* Top Bar */}
        <div className="student-topbar">
          <div>
            <h1>📝 My Quizzes</h1>
            <p>
              {quizzes.length - attemptedIds.length} pending ·{" "}
              {attemptedIds.length} attempted
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
        }}>
          <input
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: 14,
              color: "#111",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              outline: "none",
              fontFamily: "inherit",
            }}
            type="text"
            placeholder="🔍 Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{
              padding: "10px 16px",
              fontSize: 14,
              color: "#374151",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              outline: "none",
              fontFamily: "inherit",
              cursor: "pointer",
              minWidth: 140,
            }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Quizzes</option>
            <option value="pending">⏳ Pending</option>
            <option value="attempted">✅ Attempted</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="student-loading">
            ⏳ Loading quizzes...
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="student-empty-state">
            <div className="student-empty-icon">📭</div>
            <h2>No quizzes found</h2>
            <p>
              {search || filter !== "all"
                ? "Try changing your search or filter."
                : "No quizzes available yet. Check back later!"}
            </p>
          </div>
        )}

        {/* Quizzes Grid */}
        {!loading && filtered.length > 0 && (
          <div className="available-quizzes-grid">
            {filtered.map((quiz) => {
              const isAttempted = attemptedIds.includes(quiz.id);
              const attempt = getAttempt(quiz.id);

              return (
                <div className="available-quiz-card" key={quiz.id}>

                  {/* Header */}
                  <div className="available-quiz-card-header">
                    <div className="available-quiz-card-title">
                      {quiz.title}
                    </div>
                    {isAttempted ? (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: "#d1fae5",
                        color: "#065f46",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        ✅ Done
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: "#fef3c7",
                        color: "#92400e",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        ⏳ Pending
                      </span>
                    )}
                  </div>

                  {/* Meta Tags */}
                  <div className="available-quiz-card-meta">
                    <span className="available-quiz-meta-tag">
                      📚 {quiz.subject}
                    </span>
                    <span className="available-quiz-meta-tag">
                      🎓 {quiz.grade}
                    </span>
                    <span className="available-quiz-meta-tag">
                      ⏱️ {quiz.timeLimit} min
                    </span>
                    <span className="available-quiz-meta-tag">
                      ❓ {quiz.totalQuestions} Qs
                    </span>
                    <span className="available-quiz-meta-tag">
                      🏅 {quiz.totalMarks} marks
                    </span>
                  </div>

                  {/* Description */}
                  {quiz.description && (
                    <div className="available-quiz-card-desc">
                      {quiz.description}
                    </div>
                  )}

                  {/* Teacher */}
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    👨‍🏫 By {quiz.teacherName}
                  </div>

                  {/* Result if attempted */}
                  {isAttempted && attempt && (
                    <div style={{
                      background: attempt.passed ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${attempt.passed ? "#bbf7d0" : "#fecaca"}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: attempt.passed ? "#065f46" : "#991b1b",
                        }}>
                          {attempt.passed ? "✅ Passed" : "❌ Failed"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {attempt.score}/{attempt.totalMarks} marks
                          · {attempt.correctAnswers}/{attempt.totalQuestions} correct
                        </div>
                      </div>
                      <div style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: attempt.passed ? "#059669" : "#dc2626",
                      }}>
                        {attempt.percentage}%
                      </div>
                    </div>
                  )}

                  {/* Button */}
                  <button
                    className={`btn-start-quiz ${isAttempted ? "attempted" : ""}`}
                    onClick={() => {
                      if (!isAttempted) navigate(`/quiz/${quiz.id}`);
                    }}
                    disabled={isAttempted}
                  >
                    {isAttempted
                      ? "✅ Already Attempted"
                      : "🚀 Start Quiz"}
                  </button>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}