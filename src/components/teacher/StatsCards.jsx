import React from "react";
import "../../styles/teacher/dashboard.css";

const stats = [
  {
    icon: "📝",
    label: "Total Quizzes",
    value: "24",
    sub: "↑ 3 this week",
    subType: "up",
  },
  {
    icon: "👨‍🎓",
    label: "Active Students",
    value: "183",
    sub: "across 4 classes",
    subType: "neutral",
  },
  {
    icon: "📊",
    label: "Average Score",
    value: "74%",
    sub: "↓ 2% vs last week",
    subType: "down",
  },
  {
    icon: "⏳",
    label: "Pending Reviews",
    value: "7",
    sub: "short answers",
    subType: "neutral",
  },
];

export default function StatsCards() {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div className="stat-card" key={index}>
          <div className="stat-card-icon">{stat.icon}</div>
          <div className="stat-card-value">{stat.value}</div>
          <div className="stat-card-label">{stat.label}</div>
          <div className={`stat-card-sub ${stat.subType}`}>
            {stat.sub}
          </div>
        </div>
      ))}
    </div>
  );
}