import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../../styles/auth.css";

export default function StudentLogin() {
  const { login, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      const profile = await fetchUserProfile(user.uid);

      if (!profile) {
        toast.error("No account found. Please sign up.");
        return;
      }
      if (profile.role !== "student") {
        toast.error("This is a teacher account. Use teacher login.");
        return;
      }

      toast.success(`Welcome back, ${profile.name}!`);
      navigate("/student/dashboard");
    } catch (err) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        toast.error("Incorrect email or password.");
      } else {
        toast.error("Login failed. Please try again.");
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to view and attempt your quizzes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-toggle">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Your password"
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
            <div className="form-hint">
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn student-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In as Student"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/student/signup" className="auth-link">
              Create one
            </Link>
          </p>
          <p className="auth-divider">Are you a teacher?</p>
          <Link to="/teacher/login" className="switch-role-link">
            Go to teacher login →
          </Link>
        </div>
      </div>
    </div>
  );
}