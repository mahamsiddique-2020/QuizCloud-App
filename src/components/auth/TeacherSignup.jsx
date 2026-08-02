import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../../styles/auth.css";

export default function TeacherSignup() {
  const { teacherSignup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    subject: "",
    school: "",
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
      await teacherSignup({
        name: form.name,
        email: form.email,
        password: form.password,
        subject: form.subject,
        school: form.school,
      });
      toast.success("Account created! Welcome aboard.");
      navigate("/teacher/dashboard");
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
          <div className="auth-role-badge teacher-badge">Teacher</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Set up your teacher profile to start creating quizzes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="e.g. Ms. Ayesha Khan"
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
              placeholder="you@school.edu"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-input"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select subject</option>
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
            <div className="form-group">
              <label className="form-label">School / Institution</label>
              <input
                className="form-input"
                type="text"
                name="school"
                placeholder="School name"
                value={form.school}
                onChange={handleChange}
                required
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
            className="auth-btn teacher-btn"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Teacher Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/teacher/login" className="auth-link">
              Sign in
            </Link>
          </p>
          <p className="auth-divider">Are you a student?</p>
          <Link to="/student/signup" className="switch-role-link">
            Create student account →
          </Link>
        </div>
      </div>
    </div>
  );
}