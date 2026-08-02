import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/teacher/Sidebar";
import ResultsStats from "../../../components/teacher/results/ResultsStats";
import ResultsTable from "../../../components/teacher/results/ResultsTable";
import toast from "react-hot-toast";
import "../../../styles/teacher/results/results.css";

export default function QuizResults() {
  const { currentUser } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // ── Fetch teacher quizzes ────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    async function fetchQuizzes() {
      try {
        const q = query(
          collection(db, "quizzes"),
          where("teacherId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setQuizzes(data);

        // Auto select first quiz
        if (data.length > 0) {
          setSelectedQuiz(data[0].id);
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to load quizzes.");
      } finally {
        setLoadingQuizzes(false);
      }
    }

    fetchQuizzes();
  }, [currentUser]);

  // ── Fetch attempts for selected quiz ────────────────────────
  useEffect(() => {
    if (!selectedQuiz) return;

    async function fetchAttempts() {
      setLoadingAttempts(true);
      try {
        const q = query(
          collection(db, "attempts"),
          where("quizId", "==", selectedQuiz)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAttempts(data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load attempts.");
      } finally {
        setLoadingAttempts(false);
      }
    }

    fetchAttempts();
  }, [selectedQuiz]);

  return (
    <div className="results-page">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="results-main">

        {/* Top Bar */}
        <div className="results-topbar">
          <div>
            <h1>📊 Results & Analytics</h1>
            <p>
              {attempts.length} attempt
              {attempts.length !== 1 ? "s" : ""} for selected quiz
            </p>
          </div>
        </div>

        {/* Quiz Selector */}
        <div className="quiz-selector">
          <div className="quiz-selector-label">
            Select Quiz to view results
          </div>
          {loadingQuizzes ? (
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              Loading quizzes...
            </div>
          ) : quizzes.length === 0 ? (
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              No quizzes found. Create a quiz first.
            </div>
          ) : (
            <select
              className="quiz-selector-select"
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
            >
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title} — {quiz.subject} · {quiz.grade}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Loading Attempts */}
        {loadingAttempts && (
          <div className="results-loading">
            ⏳ Loading results...
          </div>
        )}

        {/* Results Content */}
        {!loadingAttempts && selectedQuiz && (
          <>
            {/* Stats */}
            <ResultsStats attempts={attempts} />

            {/* Table */}
            <ResultsTable attempts={attempts} />
          </>
        )}

      </div>
    </div>
  );
}