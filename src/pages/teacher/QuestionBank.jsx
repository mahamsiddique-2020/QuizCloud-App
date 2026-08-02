import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/teacher/Sidebar";
import toast from "react-hot-toast";
import "../../styles/teacher/questionbank.css";

const defaultQuestion = {
  type: "mcq",
  text: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  correctAnswerText: "",
  subject: "",
  difficulty: "medium",
  tags: "",
};

export default function QuestionBank() {
  const { currentUser, userProfile } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...defaultQuestion });

  // ── Fetch questions ──────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    async function fetchQuestions() {
      try {
        const q = query(
          collection(db, "questionbank"),
          where("teacherId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Sort latest first
        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setQuestions(data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [currentUser]);

  // ── Handle form change ───────────────────────────────────────
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleOptionChange(index, value) {
    const updated = [...form.options];
    updated[index] = value;
    setForm((prev) => ({ ...prev, options: updated }));
  }

  function handleTypeChange(type) {
    setForm({ ...defaultQuestion, type });
  }

  // ── Save question to bank ────────────────────────────────────
  async function handleSave() {
    if (!form.text.trim()) {
      toast.error("Please enter question text.");
      return;
    }
    if (!form.subject) {
      toast.error("Please select a subject.");
      return;
    }
    if (form.type === "mcq") {
      const empty = form.options.some((o) => !o.trim());
      if (empty) {
        toast.error("Please fill in all 4 options.");
        return;
      }
    }
    if (form.type === "truefalse" && !form.correctAnswerText) {
      toast.error("Please select correct answer.");
      return;
    }

    setSaving(true);
    try {
      const newQuestion = {
        ...form,
        teacherId: currentUser.uid,
        teacherName: userProfile.name,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "questionbank"),
        newQuestion
      );

      setQuestions((prev) => [
        {
          id: docRef.id,
          ...newQuestion,
          createdAt: { seconds: Date.now() / 1000 },
        },
        ...prev,
      ]);

      toast.success("Question saved to bank!");
      setForm({ ...defaultQuestion });
      setShowForm(false);
    } catch (err) {
      console.log(err);
      toast.error("Failed to save question.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete question ──────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteDoc(doc(db, "questionbank", id));
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Question deleted!");
    } catch (err) {
      toast.error("Failed to delete question.");
    }
  }

  // ── Copy question to clipboard ───────────────────────────────
  function handleCopy(question) {
    navigator.clipboard.writeText(question.text);
    toast.success("Question text copied!");
  }

  // ── Filter questions ─────────────────────────────────────────
  const filtered = questions.filter((q) => {
    const matchSearch = q.text
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchType =
      filterType === "all" || q.type === filterType;
    const matchDifficulty =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;
    return matchSearch && matchType && matchDifficulty;
  });

  // ── Stats ────────────────────────────────────────────────────
  const mcqCount = questions.filter((q) => q.type === "mcq").length;
  const tfCount = questions.filter((q) => q.type === "truefalse").length;
  const shortCount = questions.filter((q) => q.type === "short").length;

  // ── Type label ───────────────────────────────────────────────
  function getTypeLabel(type) {
    switch (type) {
      case "mcq":       return "MCQ";
      case "truefalse": return "True/False";
      case "short":     return "Short Answer";
      default:          return type;
    }
  }

  return (
    <div className="questionbank-page">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="questionbank-main">

        {/* Top Bar */}
        <div className="questionbank-topbar">
          <div>
            <h1>🗂️ Question Bank</h1>
            <p>{questions.length} questions saved</p>
          </div>
          <button
            style={{
              padding: "10px 20px",
              background: showForm ? "#fee2e2" : "#5b21b6",
              color: showForm ? "#991b1b" : "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "✕ Cancel" : "+ Add Question"}
          </button>
        </div>

        {/* Stats */}
        <div className="questionbank-stats">
          <div className="questionbank-stat-card">
            <div className="questionbank-stat-icon">📚</div>
            <div className="questionbank-stat-value">{questions.length}</div>
            <div className="questionbank-stat-label">Total Questions</div>
          </div>
          <div className="questionbank-stat-card">
            <div className="questionbank-stat-icon">🔘</div>
            <div className="questionbank-stat-value">{mcqCount}</div>
            <div className="questionbank-stat-label">MCQ</div>
          </div>
          <div className="questionbank-stat-card">
            <div className="questionbank-stat-icon">✅</div>
            <div className="questionbank-stat-value">{tfCount}</div>
            <div className="questionbank-stat-label">True / False</div>
          </div>
          <div className="questionbank-stat-card">
            <div className="questionbank-stat-icon">📝</div>
            <div className="questionbank-stat-value">{shortCount}</div>
            <div className="questionbank-stat-label">Short Answer</div>
          </div>
        </div>

        {/* Add Question Form */}
        {showForm && (
          <div className="questionbank-add-card">
            <div className="questionbank-add-title">
              ➕ Add New Question to Bank
            </div>

            {/* Type Selector */}
            <div className="qb-type-row">
              {["mcq", "truefalse", "short"].map((type) => (
                <button
                  key={type}
                  className={`qb-type-btn ${form.type === type ? "active" : ""}`}
                  onClick={() => handleTypeChange(type)}
                >
                  {type === "mcq" && "🔘 Multiple Choice"}
                  {type === "truefalse" && "✅ True / False"}
                  {type === "short" && "📝 Short Answer"}
                </button>
              ))}
            </div>

            <div className="qb-form">

              {/* Question Text */}
              <div className="qb-form-group">
                <label className="qb-label">Question Text</label>
                <textarea
                  className="qb-input"
                  name="text"
                  placeholder="Type your question here..."
                  value={form.text}
                  onChange={handleChange}
                />
              </div>

              {/* Subject + Difficulty + Tags */}
              <div className="qb-form-row">
                <div className="qb-form-group">
                  <label className="qb-label">Subject</label>
                  <select
                    className="qb-input"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                    <option>English</option>
                    <option>History</option>
                    <option>Computer Science</option>
                    <option>Geography</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="qb-form-group">
                  <label className="qb-label">Difficulty</label>
                  <select
                    className="qb-input"
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                  >
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>
                <div className="qb-form-group">
                  <label className="qb-label">Tags (optional)</label>
                  <input
                    className="qb-input"
                    type="text"
                    name="tags"
                    placeholder="e.g. algebra, chapter5"
                    value={form.tags}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* MCQ Options */}
              {form.type === "mcq" && (
                <div className="qb-form-group">
                  <label className="qb-label">
                    Options — click circle to mark correct
                  </label>
                  <div className="qb-options-list">
                    {form.options.map((opt, i) => (
                      <div className="qb-option-row" key={i}>
                        <input
                          type="radio"
                          className="qb-option-radio"
                          name="correctAnswer"
                          checked={form.correctAnswer === i}
                          onChange={() =>
                            setForm((prev) => ({
                              ...prev,
                              correctAnswer: i,
                            }))
                          }
                        />
                        <input
                          className={`qb-option-input ${
                            form.correctAnswer === i ? "correct" : ""
                          }`}
                          type="text"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(i, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* True False */}
              {form.type === "truefalse" && (
                <div className="qb-form-group">
                  <label className="qb-label">Correct Answer</label>
                  <div className="qb-type-row">
                    <button
                      className={`qb-type-btn ${
                        form.correctAnswerText === "true" ? "active" : ""
                      }`}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          correctAnswerText: "true",
                        }))
                      }
                    >
                      ✅ True
                    </button>
                    <button
                      className={`qb-type-btn ${
                        form.correctAnswerText === "false" ? "active" : ""
                      }`}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          correctAnswerText: "false",
                        }))
                      }
                    >
                      ❌ False
                    </button>
                  </div>
                </div>
              )}

              {/* Short Answer */}
              {form.type === "short" && (
                <div className="qb-form-group">
                  <label className="qb-label">Expected Answer</label>
                  <input
                    className="qb-input"
                    type="text"
                    name="correctAnswerText"
                    placeholder="Type the correct answer..."
                    value={form.correctAnswerText}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Save Button */}
              <div>
                <button
                  className="btn-add-to-bank"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "💾 Save to Bank"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="questionbank-toolbar">
          <input
            className="questionbank-search"
            type="text"
            placeholder="🔍 Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="questionbank-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="mcq">🔘 MCQ</option>
            <option value="truefalse">✅ True/False</option>
            <option value="short">📝 Short Answer</option>
          </select>
          <select
            className="questionbank-filter"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="all">All Difficulty</option>
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="questionbank-loading">
            ⏳ Loading questions...
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="questionbank-empty">
            <div className="questionbank-empty-icon">📭</div>
            <h2>No questions found</h2>
            <p>
              {search || filterType !== "all" || filterDifficulty !== "all"
                ? "Try changing your search or filters."
                : "Add your first question to the bank!"}
            </p>
          </div>
        )}

        {/* Questions List */}
        {!loading && filtered.length > 0 && (
          <div className="questionbank-grid">
            {filtered.map((question) => (
              <div className="qb-question-card" key={question.id}>

                {/* Header */}
                <div className="qb-question-card-header">
                  <span className="qb-question-type-badge">
                    {getTypeLabel(question.type)}
                  </span>
                  <span className="qb-question-subject-badge">
                    {question.subject}
                  </span>
                  <span className={`qb-question-difficulty-badge ${question.difficulty}`}>
                    {question.difficulty === "easy" && "🟢 Easy"}
                    {question.difficulty === "medium" && "🟡 Medium"}
                    {question.difficulty === "hard" && "🔴 Hard"}
                  </span>
                  {question.tags && (
                    <span style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      background: "#f3f4f6",
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}>
                      🏷️ {question.tags}
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <div className="qb-question-text">
                  {question.text}
                </div>

                {/* MCQ Options */}
                {question.type === "mcq" && (
                  <div className="qb-question-options">
                    {question.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`qb-question-option ${
                          question.correctAnswer === i ? "correct" : ""
                        }`}
                      >
                        {question.correctAnswer === i ? "✅" : "⬜"} {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* True False */}
                {question.type === "truefalse" && (
                  <div className="qb-question-options">
                    <div className={`qb-question-option ${question.correctAnswerText === "true" ? "correct" : ""}`}>
                      {question.correctAnswerText === "true" ? "✅" : "⬜"} True
                    </div>
                    <div className={`qb-question-option ${question.correctAnswerText === "false" ? "correct" : ""}`}>
                      {question.correctAnswerText === "false" ? "✅" : "⬜"} False
                    </div>
                  </div>
                )}

                {/* Short Answer */}
                {question.type === "short" && (
                  <div className="qb-question-options">
                    <div className="qb-question-option correct">
                      ✅ {question.correctAnswerText}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="qb-question-card-footer">
                  <span className="qb-question-meta">
                    Added by {question.teacherName}
                  </span>
                  <div className="qb-question-actions">
                    <button
                      className="btn-qb-use"
                      onClick={() => handleCopy(question)}
                    >
                      📋 Copy
                    </button>
                    <button
                      className="btn-qb-delete"
                      onClick={() => handleDelete(question.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}