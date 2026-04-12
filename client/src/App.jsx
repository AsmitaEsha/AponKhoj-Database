import { Route, Routes, useLocation } from 'react-router';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import ScrollToTop from './Components/ScrollToTop';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import RegistrationPage from './views/RegistrationPage';
import ForgotPasswordPage from './views/ForgotPassword';
import TermsPage from './views/TermsPage';
import UserProfilePage from './views/UserProfilePage';
import AdminDashboardPage from './views/AdminDashboardPage';
import AdminProfilePage from './views/AdminProfilePage';
import AdminModerationPage from './views/AdminModerationPage';
import AdminReportsPage from './views/AdminReportsPage';
import { AuthProvider } from './helpers/AuthContext';
import AdminRoute from './helpers/AdminRoute';
import HelpPage from './views/HelpPage';
import FoundListPage from './views/FoundListPage';
import AboutPage from './views/AboutPage';
import SuccessStoriesPage from './views/SuccessStoriesPage';
import SuccessStoryDetailPage from './views/SuccessStoryDetailPage';
import ReportMissingPage from './views/ReportMissingPage';
import './index.css';
import { Toaster } from 'react-hot-toast';
import ReportFoundPage from './views/ReportFoundPage';
import SearchPage from './views/SearchPage';
import ReportDetailPage from './views/ReportDetailPage';
import UserDashboardPage from './views/UserDashboardPage';
import SystemReportPage from './views/SystemReportPage';
import LegalAidPage from './views/LegalAidPage';
import PrivacyPage from './views/PrivacyPage';
import ContactPage from './views/ContactPage';

function AppShell() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/found" element={<FoundListPage />} />
          <Route path="/search-page" element={<SearchPage />} />
          <Route path="/report/:id" element={<ReportDetailPage />} />
          <Route path="/report-found" element={<ReportFoundPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/success-stories/:id" element={<SuccessStoryDetailPage />} />
          <Route path="/report-missing" element={<ReportMissingPage />} />
          <Route path="/legal-aid" element={<LegalAidPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/system-report" element={<SystemReportPage />} />

          {/* User protected routes */}
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/profile" element={<UserProfilePage />} />

          {/* Admin protected routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute>} />
          <Route path="/admin/moderation" element={<AdminRoute><AdminModerationPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <Toaster
        position="top-center"
        toastOptions={{
          error: { duration: 5000 },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}