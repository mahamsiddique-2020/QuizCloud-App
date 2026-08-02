import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../../styles/auth.css";

export default function StudentSignup() {
  const { studentSignup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
    rollNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await studentSignup({
        name: form.name,
        email: form.email,
        password: form.password,
        grade: form.grade,
        rollNumber: form.rollNumber,
      });
      toast.success("Account created! Let's start learning.");
      navigate("/student/dashboard");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-role-badge student-badge">Student</div>
          <h1 className="auth-title">Join QuizCloud</h1>
          <p className="auth-subtitle">
            Create your account and start attempting quizzes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="e.g. Zara Ahmed"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@student.edu"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Grade / Class</label>
              <select
                className="form-input"
                name="grade"
                value={form.grade}
                onChange={handleChange}
                required
              >
                <option value="">Select grade</option>
                {["6","7","8","9","10","11","12"].map((g) => (
                  <option key={g} value={`Grade ${g}`}>
                    Grade {g}
                  </option>
                ))}
                <option value="University">University</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                className="form-input"
                type="text"
                name="rollNumber"
                placeholder="Optional"
                value={form.rollNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-toggle">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-btn student-btn"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Student Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/student/login" className="auth-link">
              Sign in
            </Link>
          </p>
          <p className="auth-divider">Are you a teacher?</p>
          <Link to="/teacher/signup" className="switch-role-link">
            Create teacher account →
          </Link>
        </div>
      </div>
    </div>
  );
}