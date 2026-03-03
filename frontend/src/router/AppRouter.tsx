import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// Public pages
import LoginPage   from '../pages/auth/LoginPage';
import AboutPage   from '../pages/AboutPage';

// Student pages
import StudentDashboard      from '../pages/student/StudentDashboard';
import ApplicationDetailPage from '../pages/student/ApplicationDetailPage';
import ApplicationListPage   from '../pages/student/ApplicationListPage';
import NewApplicationPage    from '../pages/student/NewApplicationPage';
import StudentProfilePage    from '../pages/student/StudentProfilePage';

// Mentor pages
import MentorDashboard       from '../pages/mentor/MentorDashboard';
import StudentDetailPage     from '../pages/mentor/StudentDetailPage';
import ApplicationReviewPage from '../pages/mentor/ApplicationReviewPage';
import MentorProfilePage     from '../pages/mentor/MentorProfilePage';

// Admin pages
import AdminDashboard    from '../pages/admin/AdminDashboard';
import UserManagementPage from '../pages/admin/UserManagementPage';
import AssignmentPage    from '../pages/admin/AssignmentPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Shared
import MessagesPage from '../pages/shared/MessagesPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Student routes ─────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<AppLayout />}>
              <Route path="/student/dashboard"             element={<StudentDashboard />} />
              <Route path="/student/applications"          element={<ApplicationListPage />} />
              <Route path="/student/applications/new"      element={<NewApplicationPage />} />
              <Route path="/student/applications/:id"      element={<ApplicationDetailPage />} />
              <Route path="/student/profile"               element={<StudentProfilePage />} />
            </Route>
          </Route>

          {/* ── Mentor routes ──────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
            <Route element={<AppLayout />}>
              <Route path="/mentor/dashboard"              element={<MentorDashboard />} />
              <Route path="/mentor/students"               element={<MentorDashboard />} />
              <Route path="/mentor/students/:studentId"    element={<StudentDetailPage />} />
              <Route path="/mentor/applications/:id"       element={<ApplicationReviewPage />} />
              <Route path="/mentor/profile"                element={<MentorProfilePage />} />
              <Route path="/mentor/messages"               element={<MessagesPage />} />
            </Route>
          </Route>

          {/* ── Admin routes ───────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard"   element={<AdminDashboard />} />
              <Route path="/admin/users"       element={<UserManagementPage />} />
              <Route path="/admin/assignments" element={<AssignmentPage />} />
              <Route path="/admin/applications"element={<ApplicationListPage />} />
              <Route path="/admin/messages"    element={<MessagesPage />} />
              <Route path="/admin/settings"    element={<AdminSettingsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
