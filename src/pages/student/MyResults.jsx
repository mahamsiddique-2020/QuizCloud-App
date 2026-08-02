import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "../../components/student/StudentSidebar";
import toast from "react-hot-toast";
import "../../styles/student/studentdashboard.css";

export default function MyResults() {
  const { currentUser } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchAttempts() {
      try {
        const q = query(
          collection(db, "attempts"),
          where("studentId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Sort by latest first
        data.sort((a, b) => {
          const aTime = a.submittedAt?.seconds || 0;
          const bTime = b.submittedAt?.seconds || 0;
          return bTime - aTime;
        });

        setAttempts(data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load results.");
      } finally {
        setLoading(false);
      }
    }

    fetchAttempts();
  }, [currentUser]);

  // Calculate overall stats
  const totalAttempted = attempts.length;
  const totalPassed = attempts.filter((a) => a.passed).length;
  const avgScore = totalAttempted
    ? Math.round(
        attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
          totalAttempted
      )
    : 0;
  const bestScore = totalAttempted
    ? Math.max(...attempts.map((a) => a.percentage || 0))
    : 0;

  return (
    <div className="student-layout">

      {/* Sidebar */}
      <StudentSidebar />

      {/* Main */}
      <div className="student-main">

        {/* Top Bar */}
        <div className="student-topbar">
          <div>
            <h1>📈 My Results</h1>
            <p>{totalAttempted} quiz{totalAttempted !== 1 ? "zes" : ""} attempted</p>
          </div>
        </div>

        {/* Stats */}
        <div className="student-stats-grid">
          <div className="student-stat-card">
            <div className="student-stat-icon">📝</div>
            <div className="student-stat-value">{totalAttempted}</div>
            <div className="student-stat-label">Total Attempted</div>
          </div>
          <div className="student-stat-card">
            <div className="student-stat-icon">✅</div>
            <div className="student-stat-value">{totalPassed}</div>
            <div className="student-stat-label">Total Passed</div>
          </div>
          <div className="student-stat-card">
            <div className="student-stat-icon">📊</div>
            <div className="student-stat-value">{avgScore}%</div>
            <div className="student-stat-label">Average Score</div>
          </div>
          <div className="student-stat-card">
            <div className="student-stat-icon">🏆</div>
            <div className="student-stat-value">{bestScore}%</div>
            <div className="student-stat-label">Best Score</div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="student-loading">
            ⏳ Loading your results...
          </div>
        )}

        {/* Empty State */}
        {!loading && attempts.length === 0 && (
          <div className="student-empty-state">
            <div className="student-empty-icon">📭</div>
            <h2>No results yet</h2>
            <p>You have not attempted any quizzes yet. Go attempt one!</p>
          </div>
        )}

        {/* Results List */}
        {!loading && attempts.length > 0 && (
          <div>
            <div className="student-section-title">
              📋 All Attempts
            </div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              
            }}>
              {attempts.map((attempt) => (
                <div key={attempt.id} style={{
                  background: "#1a1a1a",
                  
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  borderRadius: 14,
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  
                }}>

                  {/* Score Circle */}
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: `3px solid ${attempt.passed ? "#059669" : "#dc2626"}`,
                    background: attempt.passed ? "#f0fdf4" : "#fef2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: attempt.passed ? "#059669" : "#dc2626",
                    }}>
                      {attempt.percentage}%
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color:"#ffffff",
                      marginBottom: 4,
                    }}>
                      {attempt.quizTitle}
                    </div>
                    <div style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                    }}>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        📝 {attempt.score}/{attempt.totalMarks} marks
                      </span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        ✅ {attempt.correctAnswers}/{attempt.totalQuestions} correct
                      </span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        ⏱️ {attempt.timeTaken} min
                      </span>
                    </div>
                  </div>

                  {/* Pass/Fail Badge */}
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: attempt.passed ? "#d1fae5" : "#fee2e2",
                    color: attempt.passed ? "#065f46" : "#991b1b",
                    flexShrink: 0,
                  }}>
                    {attempt.passed ? "✅ Passed" : "❌ Failed"}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}