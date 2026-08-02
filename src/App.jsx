import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import TeacherSignup from "./components/auth/TeacherSignup";
import TeacherLogin from "./components/auth/TeacherLogin";
import StudentSignup from "./components/auth/StudentSignup";
import StudentLogin from "./components/auth/StudentLogin";


import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateQuiz from "./pages/teacher/quiz/CreateQuiz";
import MyQuizzes from "./pages/teacher/MyQuizzes";
import StudentDashboard from "./pages/student/StudentDashboard";
import AttemptQuiz from "./pages/student/quiz/AttemptQuiz";
import QuizResults from "./pages/teacher/results/QuizResults";
import MyResults from "./pages/student/MyResults";
import Leaderboard from "./pages/student/Leaderboard";
import TeacherNotifications from "./pages/teacher/Notifications";
import StudentNotifications from "./pages/student/Notifications";
import TeacherSettings from "./pages/teacher/Settings";
import StudentSettings from "./pages/student/Settings";
import StudentMyQuizzes from "./pages/student/MyQuizzes";
import QuestionBank from "./pages/teacher/QuestionBank";
import Students from "./pages/teacher/Students";
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "DM Sans, sans-serif",
              fontSize: "14px",
            },
            success: { duration: 3000 },
            error: { duration: 4000 },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/teacher/signup" element={<TeacherSignup />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/student/login" element={<StudentLogin />} />

          {/* Teacher protected */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute requiredRole="teacher" redirectTo="/teacher/login">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/teacher/quizzes/create"
  element={
    <ProtectedRoute requiredRole="teacher" redirectTo="/teacher/login">
      <CreateQuiz />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/results"
  element={
    <ProtectedRoute requiredRole="student" redirectTo="/student/login">
      <MyResults />
    </ProtectedRoute>
  }
/>
<Route
  path="/teacher/quizzes"
  element={
    <ProtectedRoute requiredRole="teacher" redirectTo="/teacher/login">
      <MyQuizzes />
    </ProtectedRoute>
  }
/>
<Route
  path="/quiz/:quizId"
  element={
    <ProtectedRoute requiredRole="student" redirectTo="/student/login">
      <AttemptQuiz />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/leaderboard"
  element={
    <ProtectedRoute requiredRole="student" redirectTo="/student/login">
      <Leaderboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/teacher/results"
  element={
    <ProtectedRoute requiredRole="teacher" redirectTo="/teacher/login">
      <QuizResults />
    </ProtectedRoute>
  }
/>
{/* Teacher Notifications */}
<Route
  path="/teacher/notifications"
  element={
    <ProtectedRoute requiredRole="teacher" redirectTo="/teacher/login">
      <TeacherNotifications />
    </ProtectedRoute>
  }
/>

{/* Student Notifications */}
<Route
  path="/student/notifications"
  element={
    <ProtectedRoute requiredRole="student" redirectTo="/student/login">
      <StudentNotifications />
    </ProtectedRoute>
  }
/>
{/* Teacher Settings */}
<Route
  path="/teacher/settings"
  element={
    <ProtectedRoute requiredRole="teacher" redirectTo="/teacher/login">
      <TeacherSettings />
    </ProtectedRoute>
  }
/>

{/* Student Settings */}
<Route
  path="/student/settings"
  element={
    <ProtectedRoute requiredRole="student" redirectTo="/student/login">
      <StudentSettings />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/quizzes"
  element={
    <ProtectedRoute requiredRole="student" redirectTo="/student/login">
      <StudentMyQuizzes />
    </ProtectedRoute>
  }
/>
<Route
  path="/teacher/questions"
  element={
    <ProtectedRoute requiredRole="teacher" redirectTo="/teacher/login">
      <QuestionBank />
    </ProtectedRoute>
  }
/>
<Route
  path="/teacher/students"
  element={
    <ProtectedRoute requiredRole="teacher" redirectTo="/teacher/login">
      <Students />
    </ProtectedRoute>
  }
/>
          {/* Student protected */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student" redirectTo="/student/login">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}