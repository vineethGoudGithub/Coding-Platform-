import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';

// Pages
import { CandidateDirectEntry } from './pages/CandidateDirectEntry';
import { AdminLogin } from './pages/AdminLogin';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { TestExamination } from './pages/student/TestExamination';
import { TestResult } from './pages/student/TestResult';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTests } from './pages/admin/AdminTests';
import { AdminTestCreate } from './pages/admin/AdminTestCreate';
import { AdminResults } from './pages/admin/AdminResults';
import { AdminStudents } from './pages/admin/AdminStudents';

export const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="app-container">
            <Navbar />
            <Routes>
              {/* Direct Candidate Entry (No Login Required: Name, Email, Class, Section -> Start Test) */}
              <Route path="/" element={<CandidateDirectEntry />} />
              <Route path="/entry" element={<CandidateDirectEntry />} />

              {/* Admin Portal Authentication */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/login" element={<AdminLogin />} />

              {/* Student Assessment Execution & Results */}
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/test/:id" element={<TestExamination />} />
              <Route path="/student/result/:attemptId" element={<TestResult />} />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tests"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminTests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tests/create"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminTestCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tests/:id/edit"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminTestCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminStudents />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
