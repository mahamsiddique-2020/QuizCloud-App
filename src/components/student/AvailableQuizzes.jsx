import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/student/studentdashboard.css";

export default function AvailableQuizzes({ quizzes, attemptedIds, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="student-loading">
        ⏳ Loading available quizzes...
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="student-empty-state">
        <div className="student-empty-icon">📭</div>
        <h2>No quizzes available</h2>
        <p>Your teacher has not published any quizzes yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="available-quizzes-grid">
      {quizzes.map((quiz) => {
        const isAttempted = attemptedIds.includes(quiz.id);

        return (
          <div className="available-quiz-card" key={quiz.id}>

            {/* Header */}
            <div className="available-quiz-card-header">
              <div className="available-quiz-card-title">
                {quiz.title}
              </div>
              {isAttempted && (
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

            {/* Teacher Name */}
            <div style={{
              fontSize: 12,
              color: "#9ca3af",
            }}>
              👨‍🏫 By {quiz.teacherName}
            </div>

            {/* Start Button */}
            <button
              className={`btn-start-quiz ${isAttempted ? "attempted" : ""}`}
              onClick={() => {
                if (!isAttempted) {
                  navigate(`/quiz/${quiz.id}`);
                }
              }}
              disabled={isAttempted}
            >
              {isAttempted ? "✅ Already Attempted" : "🚀 Start Quiz"}
            </button>

          </div>
        );
      })}
    </div>
  );
}