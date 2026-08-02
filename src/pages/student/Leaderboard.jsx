import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "../../components/student/StudentSidebar";
import toast from "react-hot-toast";
import "../../styles/student/leaderboard.css";

export default function Leaderboard() {
  
  const { currentUser } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [rankings, setRankings] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [myRank, setMyRank] = useState(null);

  // ── Fetch all live quizzes ───────────────────────────────────
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const q = query(
          collection(db, "quizzes"),
          where("status", "==", "live")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setQuizzes(data);
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
  }, []);

  // ── Fetch rankings for selected quiz ────────────────────────
  useEffect(() => {
    if (!selectedQuiz) return;

    // async function fetchRankings() {
    //   setLoadingRankings(true);
    //   try {
    //     const q = query(
    //       collection(db, "attempts"),
    //       where("quizId", "==", selectedQuiz)
    //     );
    //     const snapshot = await getDocs(q);
    //     const data = snapshot.docs.map((d) => ({
    //       id: d.id,
    //       ...d.data(),
    //     }));

    //     // Sort by percentage descending
    //     data.sort((a, b) => b.percentage - a.percentage);

    //     setRankings(data);

    //     // Find my rank
    //     const myIndex = data.findIndex(
    //       (a) => a.studentId === currentUser.uid
    //     );
    //     setMyRank(myIndex !== -1 ? myIndex + 1 : null);

    //   } catch (err) {
    //     console.log(err);
    //     toast.error("Failed to load rankings.");
    //   } finally {
    //     setLoadingRankings(false);
    //   }
    // }

    async function fetchRankings() {
  setLoadingRankings(true);
  try {
    // Fetch ALL attempts for selected quiz
    const snapshot = await getDocs(
      collection(db, "attempts")
    );

    const data = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((a) => a.quizId === selectedQuiz);

    // Sort by percentage descending
    data.sort((a, b) => b.percentage - a.percentage);

    setRankings(data);

    // Find my rank
    const myIndex = data.findIndex(
      (a) => a.studentId === currentUser.uid
    );
    setMyRank(myIndex !== -1 ? myIndex + 1 : null);

  } catch (err) {
    console.log(err);
    toast.error("Failed to load rankings.");
  } finally {
    setLoadingRankings(false);
  }
}
    fetchRankings();
  }, [selectedQuiz, currentUser]);

  // ── Get initials from name ───────────────────────────────────
  function getInitials(name) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  // ── Get position emoji ───────────────────────────────────────
  function getPosition(index) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  }

  const top3 = rankings.slice(0, 3);

  return (
    <div className="leaderboard-page">

      {/* Sidebar */}
      <StudentSidebar />

      {/* Main */}
      <div className="leaderboard-main">

        {/* Top Bar */}
        <div className="leaderboard-topbar">
          <div>
            <h1>🏆 Leaderboard</h1>
            <p>See how you rank against your classmates</p>
          </div>
        </div>

        {/* Quiz Filter */}
        <div className="leaderboard-filter">
          <label>Select Quiz:</label>
          {loadingQuizzes ? (
            <span style={{ fontSize: 14, color: "#6b7280" }}>
              Loading...
            </span>
          ) : quizzes.length === 0 ? (
            <span style={{ fontSize: 14, color: "#6b7280" }}>
              No quizzes available
            </span>
          ) : (
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
            >
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title} — {quiz.subject}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Loading */}
        {loadingRankings && (
          <div className="leaderboard-loading">
            ⏳ Loading rankings...
          </div>
        )}

        {/* Empty */}
        {!loadingRankings && rankings.length === 0 && (
          <div className="leaderboard-empty">
            📭 No attempts yet for this quiz.
            Be the first to attempt it!
          </div>
        )}

        {/* Content */}
        {!loadingRankings && rankings.length > 0 && (
          <>

            {/* Top 3 Podium */}
            {top3.length >= 2 && (
              <div className="podium">

                {/* 2nd Place */}
                {top3[1] && (
                  <div className="podium-item">
                    <div className="podium-avatar silver">
                      {getInitials(top3[1].studentName)}
                    </div>
                    <div className="podium-name">
                      {top3[1].studentName}
                    </div>
                    <div className="podium-score">
                      {top3[1].percentage}%
                    </div>
                    <div className="podium-block second">2</div>
                  </div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                  <div className="podium-item">
                    <div style={{ fontSize: 24, marginBottom: 4 }}>👑</div>
                    <div className="podium-avatar gold">
                      {getInitials(top3[0].studentName)}
                    </div>
                    <div className="podium-name">
                      {top3[0].studentName}
                    </div>
                    <div className="podium-score">
                      {top3[0].percentage}%
                    </div>
                    <div className="podium-block first">1</div>
                  </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <div className="podium-item">
                    <div className="podium-avatar bronze">
                      {getInitials(top3[2].studentName)}
                    </div>
                    <div className="podium-name">
                      {top3[2].studentName}
                    </div>
                    <div className="podium-score">
                      {top3[2].percentage}%
                    </div>
                    <div className="podium-block third">3</div>
                  </div>
                )}

              </div>
            )}

            {/* My Position Banner */}
            {myRank && (
              <div className="my-position-banner">
                <div>
                  <div className="my-position-text">
                    🎯 Your position in this quiz
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: "#7c3aed",
                    marginTop: 2,
                  }}>
                    out of {rankings.length} students
                  </div>
                </div>
                <div className="my-position-rank">
                  {getPosition(myRank - 1)}
                </div>
              </div>
            )}

            {/* Full Rankings List */}
            <div className="leaderboard-card">
              <div style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#FFFFFF",
                marginBottom: 16,
              }}>
                📋 Full Rankings
              </div>

              {rankings.map((entry, index) => {
                const isMe = entry.studentId === currentUser.uid;
                return (
                  <div
                    key={entry.id}
                    className={`leaderboard-row ${isMe ? "me" : ""}`}
                  >
                    {/* Position */}
                    <div className="leaderboard-position">
                      {getPosition(index)}
                    </div>

                    {/* Avatar */}
                    <div className={`leaderboard-avatar ${isMe ? "me-avatar" : ""}`}>
                      {getInitials(entry.studentName)}
                    </div>

                    {/* Info */}
                    <div className="leaderboard-info">
                      <div className={`leaderboard-name ${isMe ? "me-name" : ""}`}>
                        {entry.studentName}
                        {isMe && (
                          <span style={{
                            fontSize: 11,
                            background: "#5b21b6",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: 20,
                            marginLeft: 8,
                            fontWeight: 600,
                          }}>
                            You
                          </span>
                        )}
                      </div>
                      <div className="leaderboard-sub">
                        {entry.correctAnswers}/{entry.totalQuestions} correct
                        · {entry.timeTaken} min
                      </div>
                    </div>

                    {/* Score */}
                    <div className="leaderboard-score-wrap">
                      <div className={`leaderboard-score ${isMe ? "me-score" : ""}`}>
                        {entry.percentage}%
                      </div>
                      <div className="leaderboard-score-label">
                        {entry.score}/{entry.totalMarks} marks
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </>
        )}

      </div>
    </div>
  );
}