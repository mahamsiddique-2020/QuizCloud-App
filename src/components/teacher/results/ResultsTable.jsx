import React, { useState } from "react";
import "../../../styles/teacher/results/results.css";

export default function ResultsTable({ attempts }) {
  const [sortBy, setSortBy] = useState("score");

  // Sort attempts
  const sorted = [...attempts].sort((a, b) => {
    if (sortBy === "score")  return b.percentage - a.percentage;
    if (sortBy === "name")   return a.studentName.localeCompare(b.studentName);
    if (sortBy === "time")   return a.timeTaken - b.timeTaken;
    return 0;
  });

  // Score badge color
  function getScoreBadge(percentage) {
    if (percentage >= 80) return "score-badge high";
    if (percentage >= 50) return "score-badge mid";
    return "score-badge low";
  }

  // Export to CSV
  function handleExport() {
    const headers = [
      "Student Name",
      "Score",
      "Total Marks",
      "Percentage",
      "Result",
      "Correct Answers",
      "Total Questions",
      "Time Taken (min)",
      "Tab Warnings",
    ];

    const rows = attempts.map((a) => [
      a.studentName,
      a.score,
      a.totalMarks,
      `${a.percentage}%`,
      a.passed ? "Passed" : "Failed",
      a.correctAnswers,
      a.totalQuestions,
      a.timeTaken,
      a.tabWarnings || 0,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quiz_results.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (attempts.length === 0) {
    return (
      <div className="results-empty">
        <div className="results-empty-icon">📭</div>
        <h2>No attempts yet</h2>
        <p>No students have attempted this quiz yet.</p>
      </div>
    );
  }

  return (
    <div className="results-card">

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <div className="results-section-title" style={{ margin: 0 }}>
          👨‍🎓 All Attempts ({attempts.length})
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>

          {/* Sort */}
          <select
            style={{
              padding: "8px 12px",
              fontSize: 13,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              outline: "none",
              fontFamily: "inherit",
              cursor: "pointer",
              background: "#fafafa",
            }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="time">Sort by Time</option>
          </select>

          {/* Export */}
          <button
            className="btn-export"
            onClick={handleExport}
          >
            📥 Export CSV
          </button>

        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Result</th>
              <th>Correct</th>
              <th>Time</th>
              <th>Tab Warnings</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((attempt, index) => (
              <tr key={attempt.id}>

                {/* Rank */}
                <td style={{ color: "#9ca3af", fontSize: 13 }}>
                  {index + 1}
                </td>

                {/* Name */}
                <td style={{ fontWeight: 500, color: "#111" }}>
                  {attempt.studentName}
                </td>

                {/* Score */}
                <td>
                  {attempt.score}/{attempt.totalMarks}
                </td>

                {/* Percentage */}
                <td>
                  <span className={getScoreBadge(attempt.percentage)}>
                    {attempt.percentage}%
                  </span>
                </td>

                {/* Pass/Fail */}
                <td>
                  <span className={`pass-badge ${attempt.passed ? "passed" : "failed"}`}>
                    {attempt.passed ? "✅ Passed" : "❌ Failed"}
                  </span>
                </td>

                {/* Correct Answers */}
                <td>
                  {attempt.correctAnswers}/{attempt.totalQuestions}
                </td>

                {/* Time */}
                <td>{attempt.timeTaken} min</td>

                {/* Tab Warnings */}
                <td>
                  <span style={{
                    color: attempt.tabWarnings > 0 ? "#dc2626" : "#6b7280",
                    fontWeight: attempt.tabWarnings > 0 ? 600 : 400,
                  }}>
                    {attempt.tabWarnings || 0}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}