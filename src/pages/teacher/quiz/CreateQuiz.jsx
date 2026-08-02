import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import Sidebar from "../../../components/teacher/Sidebar";
import QuizDetails from "../../../components/teacher/quiz/QuizDetails";
import AddQuestion from "../../../components/teacher/quiz/AddQuestion";
import QuestionCard from "../../../components/teacher/quiz/QuestionCard";
import QuestionBankPicker from "../../../components/teacher/quiz/QuestionBankPicker";
import toast from "react-hot-toast";
import "../../../styles/teacher/quiz/quizbuilder.css";

const defaultDetails = {
  title: "",
  subject: "",
  grade: "",
  timeLimit: "",
  marksPerQuestion: "1",
  passingPercent: "50",
  shuffle: "yes",
  description: "",
};

export default function CreateQuiz() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [details, setDetails] = useState({ ...defaultDetails });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);

  function handleDetailsChange(e) {
    setDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleAddQuestion(question) {
    setQuestions((prev) => [...prev, question]);
    toast.success("Question added!");
  }

  function handleDeleteQuestion(index) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    toast.success("Question removed!");
  }

  // ── Import from question bank ────────────────────────────────
  function handleImportFromBank(importedQuestions) {
    setQuestions((prev) => [...prev, ...importedQuestions]);
  }

  async function handleSave(status) {
    if (!details.title.trim()) {
      toast.error("Please enter a quiz title.");
      return;
    }
    if (!details.subject) {
      toast.error("Please select a subject.");
      return;
    }
    if (!details.grade) {
      toast.error("Please select a grade.");
      return;
    }
    if (!details.timeLimit) {
      toast.error("Please enter a time limit.");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "quizzes"), {
        ...details,
        questions,
        status,
        teacherId: currentUser.uid,
        teacherName: userProfile.name,
        totalQuestions: questions.length,
        totalMarks: questions.length * parseInt(details.marksPerQuestion),
        createdAt: serverTimestamp(),
        attemptCount: 0,
      });

      if (status === "draft") {
        toast.success("Quiz saved as draft!");
      } else {
        toast.success("Quiz published successfully!");
      }

      navigate("/teacher/quizzes");
    } catch (err) {
      console.log(err);
      toast.error("Failed to save quiz. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="quizbuilder-page">

      {/* Question Bank Picker Modal */}
      {showBankPicker && (
        <QuestionBankPicker
          onImport={handleImportFromBank}
          onClose={() => setShowBankPicker(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="quizbuilder-main">

        {/* Top Bar */}
        <div className="quizbuilder-topbar">
          <div>
            <h1>📝 Create New Quiz</h1>
            <p>
              {questions.length} question
              {questions.length !== 1 ? "s" : ""} added
            </p>
          </div>
          <div className="topbar-actions">
            <button
              className="btn-save-draft"
              onClick={() => handleSave("draft")}
              disabled={loading}
            >
              💾 Save Draft
            </button>
            <button
              className="btn-publish"
              onClick={() => handleSave("live")}
              disabled={loading}
            >
              {loading ? "Saving..." : "🚀 Publish Quiz"}
            </button>
          </div>
        </div>

        {/* Quiz Details Form */}
        <QuizDetails
          details={details}
          onChange={handleDetailsChange}
        />

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="builder-card">
            <div className="builder-card-title">
              📋 Questions ({questions.length})
            </div>
            {questions.map((question, index) => (
              <QuestionCard
                key={index}
                question={question}
                index={index}
                onDelete={handleDeleteQuestion}
              />
            ))}
          </div>
        )}

        {/* Import from Bank Button */}
        <button
          onClick={() => setShowBankPicker(true)}
          style={{
            width: "100%",
            padding: "14px",
            background: "#fff",
            border: "2px dashed #818cf8",
            borderRadius: 12,
            color: "#4f46e5",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s",
            marginBottom: 12,
          }}
          onMouseOver={(e) => e.target.style.background = "#eef2ff"}
          onMouseOut={(e) => e.target.style.background = "#fff"}
        >
          🗂️ Import Questions from Bank
        </button>

        {/* Add Question Manually */}
        <AddQuestion onAdd={handleAddQuestion} />

        {/* Bottom Save Buttons */}
        <div style={{
          display: "flex",
          gap: 12,
          justifyContent: "flex-end",
          marginTop: 8,
          marginBottom: 40,
        }}>
          <button
            className="btn-save-draft"
            onClick={() => handleSave("draft")}
            disabled={loading}
          >
            💾 Save Draft
          </button>
          <button
            className="btn-publish"
            onClick={() => handleSave("live")}
            disabled={loading}
          >
            {loading ? "Saving..." : "🚀 Publish Quiz"}
          </button>
        </div>

      </div>
    </div>
  );
}