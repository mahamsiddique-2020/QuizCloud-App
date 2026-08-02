import React from "react";
import "../../styles/student/studentdashboard.css";

export default function StudentStats({ stats }) {
  const items = [
    {
      icon: "📝",
      label: "Quizzes Attempted",
      value: stats.attempted || 0,
    },
    {
      icon: "✅",
      label: "Quizzes Passed",
      value: stats.passed || 0,
    },
    {
      icon: "📊",
      label: "Average Score",
      value: stats.averageScore ? `${stats.averageScore}%` : "0%",
    },
    {
      icon: "🏆",
      label: "Best Score",
      value: stats.bestScore ? `${stats.bestScore}%` : "0%",
    },
  ];

  return (
    <div className="student-stats-grid">
      {items.map((item, index) => (
        <div className="student-stat-card" key={index}>
          <div className="student-stat-icon">{item.icon}</div>
          <div className="student-stat-value">{item.value}</div>
          <div className="student-stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}