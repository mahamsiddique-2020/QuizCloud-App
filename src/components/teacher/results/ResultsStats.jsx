import React from "react";
import "../../../styles/teacher/results/results.css";

export default function ResultsStats({ attempts }) {
  if (attempts.length === 0) {
    return null;
  }

  // Calculate stats
  const total = attempts.length;
  const passed = attempts.filter((a) => a.passed).length;
  const failed = total - passed;
  const passRate = Math.round((passed / total) * 100);
  const scores = attempts.map((a) => a.percentage || 0);
  const avgScore = Math.round(
    scores.reduce((a, b) => a + b, 0) / scores.length
  );
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  const stats = [
    {
      icon: "👨‍🎓",
      label: "Total Attempts",
      value: total,
    },
    {
      icon: "✅",
      label: "Pass Rate",
      value: `${passRate}%`,
    },
    {
      icon: "📊",
      label: "Average Score",
      value: `${avgScore}%`,
    },
    {
      icon: "🏆",
      label: "Highest Score",
      value: `${highestScore}%`,
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="results-stats-grid">
        {stats.map((stat, index) => (
          <div className="results-stat-card" key={index}>
            <div className="results-stat-icon">{stat.icon}</div>
            <div className="results-stat-value">{stat.value}</div>
            <div className="results-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two Column — Top Performers + Pass Fail */}
      <div className="results-two-col">

        {/* Top Performers */}
        <div className="results-card">
          <div className="results-section-title">
            🏆 Top Performers
          </div>
          {attempts
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5)
            .map((attempt, index) => (
              <div className="performer-row" key={attempt.id}>
                <span className="performer-rank">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </span>
                <span className="performer-name">
                  {attempt.studentName}
                </span>
                <span className="performer-score">
                  {attempt.percentage}%
                </span>
              </div>
            ))}
        </div>

        {/* Pass vs Fail */}
        <div className="results-card">
          <div className="results-section-title">
            📈 Pass vs Fail
          </div>

          {/* Pass Bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 14, color: "#065f46", fontWeight: 600 }}>
                ✅ Passed
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                {passed} students
              </span>
            </div>
            <div style={{
              height: 10,
              background: "#f3f4f6",
              borderRadius: 5,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${passRate}%`,
                background: "#059669",
                borderRadius: 5,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* Fail Bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 14, color: "#dc2626", fontWeight: 600 }}>
                ❌ Failed
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                {failed} students
              </span>
            </div>
            <div style={{
              height: 10,
              background: "#f3f4f6",
              borderRadius: 5,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${100 - passRate}%`,
                background: "#dc2626",
                borderRadius: 5,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* Score Range */}
          <div style={{
            background: "#f9fafb",
            borderRadius: 10,
            padding: "14px",
            display: "flex",
            justifyContent: "space-between",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#059669" }}>
                {highestScore}%
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Highest</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>
                {avgScore}%
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Average</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>
                {lowestScore}%
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Lowest</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}