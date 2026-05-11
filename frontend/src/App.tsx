import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { CalendarPage } from "./pages/CalendarPage";
import { CertificatesPage } from "./pages/CertificatesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { CourseFormPage } from "./pages/CourseFormPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LessonsPage } from "./pages/LessonsPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/courses/new" element={<CourseFormPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/courses/:id/edit" element={<CourseFormPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
