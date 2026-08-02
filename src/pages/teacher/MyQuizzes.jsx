import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/teacher/Sidebar";
import toast from "react-hot-toast";
import "../../styles/teacher/myquizzes.css";

export default function MyQuizzes() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  // ── Fetch quizzes ────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    async function fetchQuizzes() {
      try {
        const q = query(
          collection(db, "quizzes"),
          where("teacherId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setQuizzes(data);
        setFiltered(data);
      } catch (err) {
        console.log("ERROR:", err.code, err.message);
        toast.error("Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [currentUser]);

  // ── Search and Filter ────────────────────────────────────────
  useEffect(() => {
    let result = quizzes;
    if (search.trim()) {
      result = result.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((q) => q.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, quizzes]);

  // ── Delete Quiz ──────────────────────────────────────────────
  async function handleDelete(quizId) {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteDoc(doc(db, "quizzes", quizId));
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      toast.success("Quiz deleted!");
    } catch (err) {
      toast.error("Failed to delete quiz.");
    }
  }

  // ── Copy Link ────────────────────────────────────────────────
  function handleCopyLink(quizId) {
    const link = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(link);
    toast.success("Quiz link copied!");
  }

  // ── Toggle expand quiz ───────────────────────────────────────
  function toggleExpand(quizId) {
    setExpandedQuiz((prev) => (prev === quizId ? null : quizId));
  }

  // ── Badge helpers ────────────────────────────────────────────
  function getBadgeClass(status) {
    switch (status) {
      case "live":      return "quiz-card-badge badge-live";
      case "draft":     return "quiz-card-badge badge-draft";
      case "scheduled": return "quiz-card-badge badge-scheduled";
      case "closed":    return "quiz-card-badge badge-closed";
      default:          return "quiz-card-badge badge-draft";
    }
  }

  function getBadgeLabel(status) {
    switch (status) {
      case "live":      return "🟢 Live";
      case "draft":     return "✏️ Draft";
      case "scheduled": return "🕐 Scheduled";
      case "closed":    return "🔴 Closed";
      default:          return status;
    }
  }

  function getTypeLabel(type) {
    switch (type) {
      case "mcq":       return "MCQ";
      case "truefalse": return "True/False";
      case "short":     return "Short Answer";
      default:          return type;
    }
  }

  return (
    <div className="myquizzes-page">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="myquizzes-main">

        {/* Top Bar */}
        <div className="myquizzes-topbar">
          <div>
            <h1>📝 My Quizzes</h1>
            <p>{filtered.length} quiz{filtered.length !== 1 ? "zes" : ""} found</p>
          </div>
          <button
            style={{
              background: "#5b21b6",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onClick={() => navigate("/teacher/quizzes/create")}
          >
            + New Quiz
          </button>
        </div>

        {/* Search and Filter */}
        <div className="myquizzes-search">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="live">🟢 Live</option>
            <option value="draft">✏️ Draft</option>
            <option value="scheduled">🕐 Scheduled</option>
            <option value="closed">🔴 Closed</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-state">⏳ Loading your quizzes...</div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2>No quizzes found</h2>
            <p>
              {search || statusFilter !== "all"
                ? "Try changing your search or filter."
                : "Create your first quiz to get started!"}
            </p>
            <button
              style={{
                background: "#5b21b6",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onClick={() => navigate("/teacher/quizzes/create")}
            >
              + Create First Quiz
            </button>
          </div>
        )}

        {/* Quizzes List */}
        {!loading && filtered.length > 0 && (
          <div className="quizzes-grid">
            {filtered.map((quiz) => (
              <div className="quiz-card" key={quiz.id}>

                {/* Header */}
                <div className="quiz-card-header">
                  <div className="quiz-card-title">{quiz.title}</div>
                  <span className={getBadgeClass(quiz.status)}>
                    {getBadgeLabel(quiz.status)}
                  </span>
                </div>

                {/* Meta Tags */}
                <div className="quiz-card-meta">
                  <span className="quiz-meta-tag">📚 {quiz.subject}</span>
                  <span className="quiz-meta-tag">🎓 {quiz.grade}</span>
                  <span className="quiz-meta-tag">⏱️ {quiz.timeLimit} min</span>
                  <span className="quiz-meta-tag">❓ {quiz.totalQuestions} Qs</span>
                </div>

                {/* Stats */}
                <div className="quiz-card-stats">
                  <div className="quiz-stat">
                    <span className="quiz-stat-value">
                      {quiz.attemptCount || 0}
                    </span>
                    <span className="quiz-stat-label">Attempts</span>
                  </div>
                  <div className="quiz-stat">
                    <span className="quiz-stat-value">{quiz.totalMarks}</span>
                    <span className="quiz-stat-label">Total Marks</span>
                  </div>
                  <div className="quiz-stat">
                    <span className="quiz-stat-value">{quiz.passingPercent}%</span>
                    <span className="quiz-stat-label">Pass Mark</span>
                  </div>
                </div>

                {/* Description */}
                {quiz.description && (
                  <div style={{
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.5,
                    padding: "10px 0",
                    borderTop: "0.5px solid #f3f4f6",
                  }}>
                    📋 {quiz.description}
                  </div>
                )}

                {/* Toggle Questions Button */}
                <button
                  onClick={() => toggleExpand(quiz.id)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: expandedQuiz === quiz.id ? "#ede9fe" : "#f9fafb",
                    color: expandedQuiz === quiz.id ? "#5b21b6" : "#374151",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    marginBottom: 8,
                  }}
                >
                  {expandedQuiz === quiz.id
                    ? "▲ Hide Questions"
                    : `▼ Show Questions (${quiz.questions?.length || 0})`}
                </button>

                {/* Questions List */}
                {expandedQuiz === quiz.id && (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 12,
                    maxHeight: 400,
                    overflowY: "auto",
                  }}>
                    {quiz.questions?.map((question, index) => (
                      <div key={index} style={{
                        background: "#fafafa",
                        border: "0.5px solid #e5e7eb",
                        borderRadius: 10,
                        padding: "14px",
                      }}>

                        {/* Question Header */}
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            background: "#ede9fe",
                            color: "#5b21b6",
                            padding: "2px 8px",
                            borderRadius: 20,
                          }}>
                            Q{index + 1}
                          </span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            background: "#f3f4f6",
                            color: "#6b7280",
                            padding: "2px 8px",
                            borderRadius: 20,
                          }}>
                            {getTypeLabel(question.type)}
                          </span>
                        </div>

                        {/* Question Text */}
                        <div style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#111",
                          marginBottom: 10,
                          lineHeight: 1.5,
                        }}>
                          {question.text}
                        </div>

                        {/* MCQ Options */}
                        {question.type === "mcq" && (
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}>
                            {question.options.map((opt, i) => (
                              <div key={i} style={{
                                fontSize: 13,
                                padding: "6px 10px",
                                borderRadius: 6,
                                background: question.correctAnswer === i
                                  ? "#d1fae5"
                                  : "#fff",
                                color: question.correctAnswer === i
                                  ? "#065f46"
                                  : "#374151",
                                border: `1px solid ${
                                  question.correctAnswer === i
                                    ? "#6ee7b7"
                                    : "#e5e7eb"
                                }`,
                                fontWeight: question.correctAnswer === i
                                  ? 600
                                  : 400,
                              }}>
                                {question.correctAnswer === i ? "✅" : "⬜"} {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* True False */}
                        {question.type === "truefalse" && (
                          <div style={{
                            display: "flex",
                            gap: 8,
                          }}>
                            {["true", "false"].map((val) => (
                              <div key={val} style={{
                                fontSize: 13,
                                padding: "6px 14px",
                                borderRadius: 6,
                                background: question.correctAnswerText === val
                                  ? "#d1fae5"
                                  : "#fff",
                                color: question.correctAnswerText === val
                                  ? "#065f46"
                                  : "#374151",
                                border: `1px solid ${
                                  question.correctAnswerText === val
                                    ? "#6ee7b7"
                                    : "#e5e7eb"
                                }`,
                                fontWeight: question.correctAnswerText === val
                                  ? 600
                                  : 400,
                              }}>
                                {question.correctAnswerText === val ? "✅" : "⬜"}{" "}
                                {val === "true" ? "True" : "False"}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Short Answer */}
                        {question.type === "short" && (
                          <div style={{
                            fontSize: 13,
                            padding: "6px 10px",
                            borderRadius: 6,
                            background: "#d1fae5",
                            color: "#065f46",
                            fontWeight: 600,
                            border: "1px solid #6ee7b7",
                          }}>
                            ✅ {question.correctAnswerText}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="quiz-card-actions">
                  <button
                    className="btn-quiz-action btn-copy"
                    onClick={() => handleCopyLink(quiz.id)}
                  >
                    🔗 Copy Link
                  </button>
                  <button
                    className="btn-quiz-action btn-delete"
                    onClick={() => handleDelete(quiz.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}