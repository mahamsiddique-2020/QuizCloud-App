import React from "react";
import "../../styles/teacher/dashboard.css";

const quizzes = [
  {
    name: "Chapter 5 — Photosynthesis",
    meta: "Biology · Grade 9 · 20 questions · 30 min",
    status: "live",
    color: "#5b21b6",
  },
  {
    name: "Mid-term: Algebra Basics",
    meta: "Math · Grade 8 · 35 questions · 60 min",
    status: "scheduled",
    color: "#1D9E75",
  },
  {
    name: "French Revolution — Quick Check",
    meta: "History · Grade 10 · 15 questions · 20 min",
    status: "draft",
    color: "#D85A30",
  },
  {
    name: "Newton's Laws of Motion",
    meta: "Physics · Grade 9 · 25 questions · 45 min",
    status: "closed",
    color: "#2563eb",
  },
];

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

export default function RecentQuizzes() {
  return (
    <div className="dash-card">
      <div className="section-title">Recent Quizzes</div>
      <div className="quiz-list">
        {quizzes.map((quiz, index) => (
          <div className="quiz-item" key={index}>

            {/* Color dot */}
            <div
              className="quiz-color-dot"
              style={{ background: quiz.color }}
            />

            {/* Info */}
            <div className="quiz-item-info">
              <div className="quiz-item-name">{quiz.name}</div>
              <div className="quiz-item-meta">{quiz.meta}</div>
            </div>

            {/* Status badge */}
            <span className={getBadgeClass(quiz.status)}>
              {getBadgeLabel(quiz.status)}
            </span>

          </div>
        ))}
      </div>
    </div>
  );
}