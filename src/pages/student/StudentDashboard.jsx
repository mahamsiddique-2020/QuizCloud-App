import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentStats from "../../components/student/StudentStats";
import AvailableQuizzes from "../../components/student/AvailableQuizzes";
import toast from "react-hot-toast";
import "../../styles/student/studentdashboard.css";

export default function StudentDashboard() {
  const { currentUser, userProfile } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [attemptedIds, setAttemptedIds] = useState([]);
  const [stats, setStats] = useState({
    attempted: 0,
    passed: 0,
    averageScore: 0,
    bestScore: 0,
  });
  const [loading, setLoading] = useState(true);

  // ── Fetch all live quizzes ───────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    async function fetchData() {
      try {
        // Fetch all live quizzes
        const quizQuery = query(
          collection(db, "quizzes"),
          where("status", "==", "live")
        );
        const quizSnapshot = await getDocs(quizQuery);
        const quizData = quizSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setQuizzes(quizData);

        // Fetch student attempts
        const attemptQuery = query(
          collection(db, "attempts"),
          where("studentId", "==", currentUser.uid)
        );
        const attemptSnapshot = await getDocs(attemptQuery);
        const attemptData = attemptSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAttempts(attemptData);

        // Get attempted quiz IDs
        const ids = attemptData.map((a) => a.quizId);
        setAttemptedIds(ids);

        // Calculate stats
        if (attemptData.length > 0) {
          const scores = attemptData.map((a) => a.percentage || 0);
          const passed = attemptData.filter((a) => a.passed).length;
          const avg = Math.round(
            scores.reduce((a, b) => a + b, 0) / scores.length
          );
          const best = Math.max(...scores);

          setStats({
            attempted: attemptData.length,
            passed,
            averageScore: avg,
            bestScore: best,
          });
        }
      } catch (err) {
        console.log("Error:", err.message);
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  return (
    <div className="student-layout">

      {/* Sidebar */}
      <StudentSidebar />

      {/* Main */}
      <div className="student-main">

        {/* Top Bar */}
        <div className="student-topbar">
          <div>
            <h1>
              Welcome, {userProfile?.name?.split(" ")[0]} 👋
            </h1>
            <p>
              {quizzes.length - attemptedIds.length} quiz
              {quizzes.length - attemptedIds.length !== 1 ? "zes" : ""} waiting for you
            </p>
          </div>
          <div style={{
            background: "#d1fae5",
            color: "#065f46",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
          }}>
            🎓 Student
          </div>
        </div>

        {/* Stats */}
        <StudentStats stats={stats} />

        {/* Available Quizzes */}
        <div className="student-section-title">
          📋 Available Quizzes ({quizzes.length})
        </div>
        <AvailableQuizzes
          quizzes={quizzes}
          attemptedIds={attemptedIds}
          loading={loading}
        />

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <div>
            <div className="student-section-title">
              📈 Recent Attempts
            </div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}>
              {attempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} style={{
                  background: "#fff",
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111",
                      marginBottom: 4,
                    }}>
                      {attempt.quizTitle || "Quiz"}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "#6b7280",
                    }}>
                      Score: {attempt.score}/{attempt.totalMarks} marks
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: attempt.passed ? "#065f46" : "#dc2626",
                    }}>
                      {attempt.percentage}%
                    </div>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: attempt.passed ? "#065f46" : "#dc2626",
                    }}>
                      {attempt.passed ? "✅ Passed" : "❌ Failed"}
                    </div>
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