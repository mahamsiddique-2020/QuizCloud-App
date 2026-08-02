import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/student/quiz/attemptquiz.css";

export default function QuizResult({ result }) {
  const navigate = useNavigate();

  const {
    quizTitle,
    score,
    totalMarks,
    percentage,
    passed,
    totalQuestions,
    correctAnswers,
    timeTaken,
  } = result;

  return (
    <div className="result-page">
      <div className="result-card">

        {/* Emoji */}
        <div className="result-emoji">
          {passed ? "🎉" : "😔"}
        </div>

        {/* Title */}
        <div className="result-title">
          {passed ? "Congratulations!" : "Better luck next time!"}
        </div>

        <div className="result-subtitle">
          {quizTitle}
        </div>

        {/* Score Circle */}
        <div className={`result-score-circle ${passed ? "passed" : "failed"}`}>
          <div className="result-score-value">{percentage}%</div>
          <div className="result-score-label">
            {passed ? "Passed ✅" : "Failed ❌"}
          </div>
        </div>

        {/* Stats */}
        <div className="result-stats">
          <div className="result-stat">
            <div className="result-stat-value">
              {score}/{totalMarks}
            </div>
            <div className="result-stat-label">Score</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-value">
              {correctAnswers}/{totalQuestions}
            </div>
            <div className="result-stat-label">Correct</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-value">
              {timeTaken}m
            </div>
            <div className="result-stat-label">Time Taken</div>
          </div>
        </div>

        {/* Feedback Message */}
        <div style={{
          border: `1px solid ${passed ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 24,
          fontSize: 14,
          color: passed ? "#065f46" : "#991b1b",
          lineHeight: 1.6,
        }}>
          {passed
            ? `Great job! You scored ${percentage}% and passed the quiz. Keep it up! 🌟`
            : `You scored ${percentage}%. Don't give up — review the material and try again! 💪`
          }
        </div>

        {/* Go to Dashboard Button */}
        <button
          className="btn-go-dashboard"
          onClick={() => navigate("/student/dashboard")}
        >
          Go to Dashboard
        </button>

      </div>
    </div>
  );
}