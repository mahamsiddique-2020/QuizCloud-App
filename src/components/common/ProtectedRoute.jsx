import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  children,
  requiredRole = null,
  redirectTo = "/",
}) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.spinner} />
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    const fallback =
      userRole === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

const styles = {
  screen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    fontFamily: "sans-serif",
    color: "#6b7280",
  },
  spinner: {
    width: 28,
    height: 28,
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #5b21b6",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};