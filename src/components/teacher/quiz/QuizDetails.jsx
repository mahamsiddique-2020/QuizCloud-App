import React from "react";
import "../../../styles/teacher/quiz/quizbuilder.css";

export default function QuizDetails({ details, onChange }) {
  return (
    <div className="builder-card">
      <div className="builder-card-title">📋 Quiz Details</div>

      <div className="builder-form-row">

        {/* Quiz Title */}
        <div className="builder-form-group full">
          <label className="builder-label">Quiz Title</label>
          <input
            className="builder-input"
            type="text"
            name="title"
            placeholder="e.g. Chapter 5 — Photosynthesis"
            value={details.title}
            onChange={onChange}
            required
          />
        </div>

        {/* Subject */}
        <div className="builder-form-group">
          <label className="builder-label">Subject</label>
          <select
            className="builder-input"
            name="subject"
            value={details.subject}
            onChange={onChange}
            required
          >
            <option value="">Select subject</option>
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Biology</option>
            <option>English</option>
            <option>History</option>
            <option>Computer Science</option>
            <option>Geography</option>
            <option>Other</option>
          </select>
        </div>

        {/* Grade */}
        <div className="builder-form-group">
          <label className="builder-label">Grade / Class</label>
          <select
            className="builder-input"
            name="grade"
            value={details.grade}
            onChange={onChange}
            required
          >
            <option value="">Select grade</option>
            {["6","7","8","9","10","11","12"].map((g) => (
              <option key={g} value={`Grade ${g}`}>Grade {g}</option>
            ))}
            <option value="University">University</option>
          </select>
        </div>

        {/* Time Limit */}
        <div className="builder-form-group">
          <label className="builder-label">Time Limit (minutes)</label>
          <input
            className="builder-input"
            type="number"
            name="timeLimit"
            placeholder="e.g. 30"
            min="1"
            max="180"
            value={details.timeLimit}
            onChange={onChange}
            required
          />
        </div>

        {/* Marks Per Question */}
        <div className="builder-form-group">
          <label className="builder-label">Marks Per Question</label>
          <input
            className="builder-input"
            type="number"
            name="marksPerQuestion"
            placeholder="e.g. 1"
            min="1"
            max="10"
            value={details.marksPerQuestion}
            onChange={onChange}
            required
          />
        </div>

        {/* Passing Marks */}
        <div className="builder-form-group">
          <label className="builder-label">Passing Percentage %</label>
          <input
            className="builder-input"
            type="number"
            name="passingPercent"
            placeholder="e.g. 50"
            min="1"
            max="100"
            value={details.passingPercent}
            onChange={onChange}
            required
          />
        </div>

        {/* Shuffle Questions */}
        <div className="builder-form-group">
          <label className="builder-label">Shuffle Questions</label>
          <select
            className="builder-input"
            name="shuffle"
            value={details.shuffle}
            onChange={onChange}
          >
            <option value="yes">Yes — randomize order</option>
            <option value="no">No — keep order</option>
          </select>
        </div>

        {/* Description */}
        <div className="builder-form-group full">
          <label className="builder-label">
            Description (optional)
          </label>
          <textarea
            className="builder-input"
            name="description"
            placeholder="Instructions or notes for students..."
            value={details.description}
            onChange={onChange}
          />
        </div>

      </div>
    </div>
  );
}