import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/authStore';

// Pages
import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import StudentLayout  from './pages/student/StudentLayout';
import CoordLayout    from './pages/coordinator/CoordLayout';
import StudentDashboard    from './pages/student/StudentDashboard';
import StudentCompanies    from './pages/student/StudentCompanies';
import StudentApplications from './pages/student/StudentApplications';
import StudentProfile      from './pages/student/StudentProfile';
import CoordDashboard      from './pages/coordinator/CoordDashboard';
import CoordStudents       from './pages/coordinator/CoordStudents';
import CoordCompanies      from './pages/coordinator/CoordCompanies';
import CoordApplications   from './pages/coordinator/CoordApplications';
import CoordAddCompany     from './pages/coordinator/CoordAddCompany';
import NotFound       from './pages/NotFound';

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'student' ? '/student/dashboard' : '/coordinator/dashboard'} replace />;
  return children;
};

// ─── Public Route (redirect if logged in) ────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'student' ? '/student/dashboard' : '/coordinator/dashboard'} replace />;
  }
  return children;
};

export default function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, []); // eslint-disable-line

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        duration: 3500,
        style: { fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: '0.875rem', borderRadius: '12px' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }} />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<StudentDashboard />} />
          <Route path="companies"    element={<StudentCompanies />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="profile"      element={<StudentProfile />} />
        </Route>

        {/* Coordinator Routes */}
        <Route path="/coordinator" element={<ProtectedRoute role="coordinator"><CoordLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<CoordDashboard />} />
          <Route path="students"     element={<CoordStudents />} />
          <Route path="companies"    element={<CoordCompanies />} />
          <Route path="applications" element={<CoordApplications />} />
          <Route path="companies/add"    element={<CoordAddCompany />} />
          <Route path="companies/edit/:id" element={<CoordAddCompany />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
