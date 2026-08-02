import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function QuestionBankPicker({ onImport, onClose }) {
  const { currentUser } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selected, setSelected] = useState([]);

  // ── Fetch questions from bank ────────────────────────────────
  useEffect(() => {
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
        setQuestions(data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load question bank.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [currentUser]);

  // ── Toggle select question ───────────────────────────────────
  function toggleSelect(questionId) {
    setSelected((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  }

  // ── Select all ───────────────────────────────────────────────
  function selectAll() {
    setSelected(filtered.map((q) => q.id));
  }

  // ── Import selected ──────────────────────────────────────────
  function handleImport() {
    if (selected.length === 0) {
      toast.error("Please select at least one question.");
      return;
    }

    const selectedQuestions = questions
      .filter((q) => selected.includes(q.id))
      .map((q) => ({
        type: q.type,
        text: q.text,
        options: q.options || ["", "", "", ""],
        correctAnswer: q.correctAnswer || 0,
        correctAnswerText: q.correctAnswerText || "",
      }));

    onImport(selectedQuestions);
    toast.success(`${selectedQuestions.length} question(s) imported!`);
    onClose();
  }

  // ── Filter ───────────────────────────────────────────────────
  const filtered = questions.filter((q) => {
    const matchSearch = q.text
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchType =
      filterType === "all" || q.type === filterType;
    return matchSearch && matchType;
  });

  function getTypeLabel(type) {
    switch (type) {
      case "mcq":       return "MCQ";
      case "truefalse": return "True/False";
      case "short":     return "Short Answer";
      default:          return type;
    }
  }

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        width: "100%",
        maxWidth: 680,
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "0.5px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111", margin: 0 }}>
              🗂️ Import from Question Bank
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
              {selected.length} question(s) selected
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Search and Filter */}
        <div style={{
          padding: "14px 24px",
          borderBottom: "0.5px solid #f3f4f6",
          display: "flex",
          gap: 10,
        }}>
          <input
            style={{
              flex: 1,
              padding: "9px 14px",
              fontSize: 14,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              outline: "none",
              fontFamily: "inherit",
            }}
            type="text"
            placeholder="🔍 Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{
              padding: "9px 14px",
              fontSize: 14,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              outline: "none",
              fontFamily: "inherit",
              cursor: "pointer",
              background: "#fafafa",
            }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="mcq">🔘 MCQ</option>
            <option value="truefalse">✅ True/False</option>
            <option value="short">📝 Short Answer</option>
          </select>
          <button
            onClick={selectAll}
            style={{
              padding: "9px 14px",
              fontSize: 13,
              fontWeight: 600,
              background: "#ede9fe",
              color: "#5b21b6",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            ✅ Select All
          </button>
        </div>

        {/* Questions List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 24px" }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
              ⏳ Loading questions...
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ fontWeight: 600, color: "#111" }}>
                No questions in bank
              </p>
              <p style={{ fontSize: 13 }}>
                Add questions to your Question Bank first.
              </p>
            </div>
          )}

          {/* Questions */}
          {!loading && filtered.map((question) => {
            const isSelected = selected.includes(question.id);
            return (
              <div
                key={question.id}
                onClick={() => toggleSelect(question.id)}
                style={{
                  border: `1.5px solid ${isSelected ? "#5b21b6" : "#e5e7eb"}`,
                  background: isSelected ? "#faf5ff" : "#fff",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 10,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {/* Question Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}>
                  {/* Checkbox */}
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `2px solid ${isSelected ? "#5b21b6" : "#d1d5db"}`,
                    background: isSelected ? "#5b21b6" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 12,
                    color: "#fff",
                  }}>
                    {isSelected ? "✓" : ""}
                  </div>

                  {/* Type Badge */}
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: "#ede9fe",
                    color: "#5b21b6",
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}>
                    {getTypeLabel(question.type)}
                  </span>

                  {/* Subject */}
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}>
                    {question.subject}
                  </span>

                  {/* Difficulty */}
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: question.difficulty === "easy"
                      ? "#d1fae5"
                      : question.difficulty === "medium"
                      ? "#fef3c7"
                      : "#fee2e2",
                    color: question.difficulty === "easy"
                      ? "#065f46"
                      : question.difficulty === "medium"
                      ? "#92400e"
                      : "#991b1b",
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}>
                    {question.difficulty}
                  </span>
                </div>

                {/* Question Text */}
                <div style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#111",
                  lineHeight: 1.5,
                  marginBottom: question.type === "mcq" ? 10 : 0,
                }}>
                  {question.text}
                </div>

                {/* MCQ Options Preview */}
                {question.type === "mcq" && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                  }}>
                    {question.options?.map((opt, i) => (
                      <div key={i} style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: question.correctAnswer === i
                          ? "#d1fae5"
                          : "#f3f4f6",
                        color: question.correctAnswer === i
                          ? "#065f46"
                          : "#374151",
                        fontWeight: question.correctAnswer === i ? 600 : 400,
                      }}>
                        {question.correctAnswer === i ? "✅" : "⬜"} {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* True False Preview */}
                {question.type === "truefalse" && (
                  <div style={{ fontSize: 12, color: "#065f46", fontWeight: 600 }}>
                    ✅ Answer: {question.correctAnswerText === "true" ? "True" : "False"}
                  </div>
                )}

                {/* Short Answer Preview */}
                {question.type === "short" && (
                  <div style={{ fontSize: 12, color: "#065f46", fontWeight: 600 }}>
                    ✅ Answer: {question.correctAnswerText}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "0.5px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            {selected.length} of {filtered.length} selected
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setSelected([])}
              style={{
                padding: "10px 18px",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Clear
            </button>
            <button
              onClick={handleImport}
              style={{
                padding: "10px 24px",
                background: "#5b21b6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ➕ Import {selected.length > 0 ? `(${selected.length})` : ""}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}