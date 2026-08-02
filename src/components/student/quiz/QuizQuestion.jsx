import React from "react";
import "../../../styles/student/quiz/attemptquiz.css";

const LABELS = ["A", "B", "C", "D"];

export default function QuizQuestion({
  question,
  index,
  total,
  answer,
  onAnswer,
}) {
  return (
    <div>
      {/* Question Counter */}
      <div className="question-counter">
        Question <span>{index + 1}</span> of {total}
      </div>

      {/* Question Card */}
      <div className="question-card-attempt">

        {/* Question Text */}
        <div className="question-text-attempt">
          {question.text}
        </div>

        {/* MCQ Options */}
        {question.type === "mcq" && (
          <div className="options-grid">
            {question.options.map((option, i) => (
              <button
                key={i}
                className={`option-btn ${answer === i ? "selected" : ""}`}
                onClick={() => onAnswer(i)}
              >
                <span className="option-label">{LABELS[i]}</span>
                {option}
              </button>
            ))}
          </div>
        )}

        {/* True / False */}
        {question.type === "truefalse" && (
          <div className="truefalse-grid">
            <button
              className={`truefalse-btn ${
                answer === "true" ? "selected" : ""
              }`}
              onClick={() => onAnswer("true")}
            >
              ✅ True
            </button>
            <button
              className={`truefalse-btn ${
                answer === "false" ? "selected" : ""
              }`}
              onClick={() => onAnswer("false")}
            >
              ❌ False
            </button>
          </div>
        )}

        {/* Short Answer */}
        {question.type === "short" && (
          <textarea
            className="short-answer-input"
            placeholder="Type your answer here..."
            value={answer || ""}
            onChange={(e) => onAnswer(e.target.value)}
          />
        )}

      </div>
    </div>
  );
}