import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import QuizTimer from "../../../components/student/quiz/QuizTimer";
import QuizQuestion from "../../../components/student/quiz/QuizQuestion";
import QuizResult from "../../../components/student/quiz/QuizResult";
import toast from "react-hot-toast";
import "../../../styles/student/quiz/attemptquiz.css";

export default function AttemptQuiz() {
  const { quizId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [tabWarnings, setTabWarnings] = useState(0);

  // ── Fetch Quiz ───────────────────────────────────────────────
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const docRef = doc(db, "quizzes", quizId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          toast.error("Quiz not found!");
          navigate("/student/dashboard");
          return;
        }

        const data = docSnap.data();

        if (data.status !== "live") {
          toast.error("This quiz is not available.");
          navigate("/student/dashboard");
          return;
        }

        setQuiz({ id: docSnap.id, ...data });
      } catch (err) {
        console.log(err);
        toast.error("Failed to load quiz.");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
}, [quizId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Anti Cheat — Tab Switch Detection ───────────────────────
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        setTabWarnings((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            toast.error("Too many tab switches! Quiz auto-submitted.");
            handleSubmit(true);
          } else {
            toast.error(
              `⚠️ Warning ${newCount}/3: Don't switch tabs during quiz!`
            );
          }
          return newCount;
        });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
 }, [answers]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Answer Handler ───────────────────────────────────────────
  function handleAnswer(answer) {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: answer,
    }));
  }

  // ── Submit Quiz ──────────────────────────────────────────────
  async function handleSubmit(autoSubmit = false) {
    if (submitting) return;

    if (
      !autoSubmit &&
      !window.confirm("Are you sure you want to submit the quiz?")
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const questions = quiz.questions;
      const marksPerQuestion = parseInt(quiz.marksPerQuestion) || 1;
      const passingPercent = parseInt(quiz.passingPercent) || 50;

      let correctAnswers = 0;

      // Grade each question
      questions.forEach((question, index) => {
        const studentAnswer = answers[index];

        if (question.type === "mcq") {
          if (studentAnswer === question.correctAnswer) {
            correctAnswers++;
          }
        } else if (question.type === "truefalse") {
          if (studentAnswer === question.correctAnswerText) {
            correctAnswers++;
          }
        } else if (question.type === "short") {
          // Simple case-insensitive check
          if (
            studentAnswer &&
            studentAnswer.trim().toLowerCase() ===
              question.correctAnswerText.trim().toLowerCase()
          ) {
            correctAnswers++;
          }
        }
      });

      const score = correctAnswers * marksPerQuestion;
      const totalMarks = questions.length * marksPerQuestion;
      const percentage = Math.round((score / totalMarks) * 100);
      const passed = percentage >= passingPercent;
      const timeTaken = Math.round((Date.now() - startTime) / 60000);

      // Save attempt to Firebase
      await addDoc(collection(db, "attempts"), {
        studentId: currentUser.uid,
        studentName: userProfile.name,
        quizId: quiz.id,
        quizTitle: quiz.title,
        answers,
        score,
        totalMarks,
        percentage,
        passed,
        correctAnswers,
        totalQuestions: questions.length,
        timeTaken,
        tabWarnings,
        submittedAt: serverTimestamp(),
      });

      // Show result
      setResult({
        quizTitle: quiz.title,
        score,
        totalMarks,
        percentage,
        passed,
        correctAnswers,
        totalQuestions: questions.length,
        timeTaken,
      });

    } catch (err) {
      console.log(err);
      toast.error("Failed to submit quiz. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        color: "#6b7280",
        fontSize: 16,
      }}>
        ⏳ Loading quiz...
      </div>
    );
  }

  // ── Show Result ──────────────────────────────────────────────
  if (result) {
    return <QuizResult result={result} />;
  }

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="attempt-page">

      {/* Top Bar */}
      <div className="attempt-topbar">
        <div className="attempt-topbar-left">
          <div className="attempt-quiz-title">{quiz.title}</div>
          <div className="attempt-quiz-meta">
            {quiz.subject} · {quiz.grade} · {questions.length} questions
          </div>
        </div>
        <div className="attempt-topbar-right">
          {tabWarnings > 0 && (
            <div style={{
              fontSize: 13,
              color: "#dc2626",
              fontWeight: 600,
            }}>
              ⚠️ {tabWarnings}/3 warnings
            </div>
          )}
          <QuizTimer
            totalMinutes={parseInt(quiz.timeLimit)}
            onTimeUp={() => handleSubmit(true)}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="attempt-progress">
        <div
          className="attempt-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="attempt-content">

        {/* Question Dots */}
        <div className="question-dots">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`question-dot ${
                i === currentIndex
                  ? "current"
                  : answers[i] !== undefined
                  ? "answered"
                  : ""
              }`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>

        {/* Current Question */}
        <QuizQuestion
          question={currentQuestion}
          index={currentIndex}
          total={questions.length}
          answer={answers[currentIndex]}
          onAnswer={handleAnswer}
        />

        {/* Navigation */}
        <div className="attempt-nav">
          <button
            className="btn-prev"
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {answeredCount}/{questions.length} answered
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              className="btn-next"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn-submit-quiz"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "✅ Submit Quiz"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}