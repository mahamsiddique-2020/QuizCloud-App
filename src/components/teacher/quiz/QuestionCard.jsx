import React from "react";
import "../../../styles/teacher/quiz/quizbuilder.css";

function getTypeLabel(type) {
  switch (type) {
    case "mcq":       return "Multiple Choice";
    case "truefalse": return "True / False";
    case "short":     return "Short Answer";
    default:          return type;
  }
}

export default function QuestionCard({ question, index, onDelete }) {
  return (
    <div className="question-card">

      {/* Header */}
      <div className="question-card-header">
        <span className="question-card-number">
          Q{index + 1}
        </span>
        <span className="question-card-type">
          {getTypeLabel(question.type)}
        </span>
      </div>

      {/* Question Text */}
      <div className="question-card-text">
        {question.text}
      </div>

      {/* MCQ Options */}
      {question.type === "mcq" && (
        <div className="question-card-options">
          {question.options.map((option, i) => (
            <div
              key={i}
              className={`question-card-option ${
                question.correctAnswer === i ? "correct" : ""
              }`}
            >
              {question.correctAnswer === i ? "✅" : "⬜"} {option}
            </div>
          ))}
        </div>
      )}

      {/* True / False Answer */}
      {question.type === "truefalse" && (
        <div className="question-card-options">
          <div
            className={`question-card-option ${
              question.correctAnswerText === "true" ? "correct" : ""
            }`}
          >
            {question.correctAnswerText === "true" ? "✅" : "⬜"} True
          </div>
          <div
            className={`question-card-option ${
              question.correctAnswerText === "false" ? "correct" : ""
            }`}
          >
            {question.correctAnswerText === "false" ? "✅" : "⬜"} False
          </div>
        </div>
      )}

      {/* Short Answer */}
      {question.type === "short" && (
        <div className="question-card-options">
          <div className="question-card-option correct">
            ✅ Expected: {question.correctAnswerText}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="question-card-actions">
        <button
          className="btn-delete-question"
          onClick={() => onDelete(index)}
        >
          🗑️ Delete
        </button>
      </div>

    </div>
  );
}