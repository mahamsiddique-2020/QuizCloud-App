import React from "react";
import "../../styles/teacher/dashboard.css";

const activities = [
  {
    text: "Zara Ahmed submitted Photosynthesis quiz",
    time: "2m ago",
    color: "#5b21b6",
  },
  {
    text: "Hamza Khan scored 91% in Algebra Basics",
    time: "15m ago",
    color: "#059669",
  },
  {
    text: "Algebra mid-term auto-scheduled for Friday",
    time: "1h ago",
    color: "#2563eb",
  },
  {
    text: "7 short answers flagged for manual review",
    time: "3h ago",
    color: "#d97706",
  },
  {
    text: "Umar Raza scored below 50% — needs attention",
    time: "5h ago",
    color: "#dc2626",
  },
  {
    text: "New student Nadia Farooq joined your class",
    time: "1d ago",
    color: "#059669",
  },
];

export default function ActivityFeed() {
  return (
    <div className="dash-card">
      <div className="section-title">Recent Activity</div>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div className="activity-item" key={index}>

            {/* Colored dot */}
            <div
              className="activity-dot"
              style={{ background: activity.color }}
            />

            {/* Text */}
            <span className="activity-text">{activity.text}</span>

            {/* Time */}
            <span className="activity-time">{activity.time}</span>

          </div>
        ))}
      </div>
    </div>
  );
}