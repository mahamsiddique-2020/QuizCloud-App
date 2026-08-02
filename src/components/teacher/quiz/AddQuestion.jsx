import React, { useState } from "react";
import "../../../styles/teacher/quiz/quizbuilder.css";

const defaultQuestion = {
  type: "mcq",
  text: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  correctAnswerText: "",
};

export default function AddQuestion({ onAdd }) {
  const [question, setQuestion] = useState({ ...defaultQuestion });

  function handleTypeChange(type) {
    setQuestion({ ...defaultQuestion, type });
  }

  function handleQuestionText(e) {
    setQuestion((prev) => ({ ...prev, text: e.target.value }));
  }

  function handleOptionChange(index, value) {
    const updated = [...question.options];
    updated[index] = value;
    setQuestion((prev) => ({ ...prev, options: updated }));
  }

  function handleCorrectAnswer(index) {
    setQuestion((prev) => ({ ...prev, correctAnswer: index }));
  }

  function handleTrueFalseAnswer(value) {
    setQuestion((prev) => ({ ...prev, correctAnswerText: value }));
  }

  function handleShortAnswer(e) {
    setQuestion((prev) => ({
      ...prev,
      correctAnswerText: e.target.value,
    }));
  }

  function handleAddQuestion() {
    // Validation
    if (!question.text.trim()) {
      alert("Please enter question text.");
      return;
    }

    if (question.type === "mcq") {
      const emptyOption = question.options.some((o) => !o.trim());
      if (emptyOption) {
        alert("Please fill in all 4 options.");
        return;
      }
    }

    if (
      question.type === "truefalse" &&
      !question.correctAnswerText
    ) {
      alert("Please select correct answer.");
      return;
    }

    // Add question and reset form
    onAdd({ ...question });
    setQuestion({ ...defaultQuestion });
  }

  return (
    <div className="builder-card">
      <div className="builder-card-title">➕ Add New Question</div>

      {/* Question Type Selector */}
      <div className="question-type-row">
        <button
          className={`type-btn ${question.type === "mcq" ? "active" : ""}`}
          onClick={() => handleTypeChange("mcq")}
        >
          🔘 Multiple Choice
        </button>
        <button
          className={`type-btn ${question.type === "truefalse" ? "active" : ""}`}
          onClick={() => handleTypeChange("truefalse")}
        >
          ✅ True / False
        </button>
        <button
          className={`type-btn ${question.type === "short" ? "active" : ""}`}
          onClick={() => handleTypeChange("short")}
        >
          📝 Short Answer
        </button>
      </div>

      {/* Question Text */}
      <div className="builder-form-group" style={{ marginBottom: 16 }}>
        <label className="builder-label">Question Text</label>
        <textarea
          className="builder-input"
          placeholder="Type your question here..."
          value={question.text}
          onChange={handleQuestionText}
        />
      </div>

      {/* MCQ Options */}
      {question.type === "mcq" && (
        <div>
          <label className="builder-label" style={{ marginBottom: 10, display: "block" }}>
            Options — click the circle to mark correct answer
          </label>
          <div className="options-list">
            {question.options.map((option, index) => (
              <div className="option-row" key={index}>
                <input
                  type="radio"
                  className="option-radio"
                  name="correctAnswer"
                  checked={question.correctAnswer === index}
                  onChange={() => handleCorrectAnswer(index)}
                />
                <input
                  className={`option-input ${
                    question.correctAnswer === index ? "correct" : ""
                  }`}
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
            🟢 Green option = correct answer
          </p>
        </div>
      )}

      {/* True / False Options */}
      {question.type === "truefalse" && (
        <div>
          <label className="builder-label" style={{ marginBottom: 10, display: "block" }}>
            Select Correct Answer
          </label>
          <div className="question-type-row">
            <button
              className={`type-btn ${
                question.correctAnswerText === "true" ? "active" : ""
              }`}
              onClick={() => handleTrueFalseAnswer("true")}
            >
              ✅ True
            </button>
            <button
              className={`type-btn ${
                question.correctAnswerText === "false" ? "active" : ""
              }`}
              onClick={() => handleTrueFalseAnswer("false")}
            >
              ❌ False
            </button>
          </div>
        </div>
      )}

      {/* Short Answer */}
      {question.type === "short" && (
        <div className="builder-form-group" style={{ marginBottom: 16 }}>
          <label className="builder-label">
            Expected Answer (for auto grading)
          </label>
          <input
            className="builder-input"
            type="text"
            placeholder="Type the correct answer..."
            value={question.correctAnswerText}
            onChange={handleShortAnswer}
          />
        </div>
      )}

      {/* Add Button */}
      <button
        className="btn-add-question"
        onClick={handleAddQuestion}
      >
        + Add This Question
      </button>

    </div>
  );
}