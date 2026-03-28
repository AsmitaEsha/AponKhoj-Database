import { Route, Routes, useLocation } from 'react-router';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import ScrollToTop from './Components/ScrollToTop';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import RegistrationPage from './views/RegistrationPage';
import ForgotPasswordPage from './views/ForgotPassword';
import RegistrationVerificationPage from './views/RegistrationVerificationPage';
import TermsPage from './views/TermsPage';
import UserProfilePage from './views/UserProfilePage';
import AdminDashboardPage from './views/AdminDashboardPage';
import AdminProfilePage from './views/AdminProfilePage';
import AdminModerationPage from './views/AdminModerationPage';
import { AuthProvider } from './helpers/AuthContext';
import AdminRoute from './helpers/AdminRoute';
import HelpPage from './views/HelpPage';
import FoundListPage from './views/FoundListPage';
import AboutPage from './views/AboutPage';
import SuccessStoriesPage from './views/SuccessStoriesPage';
import ReportMissingPage from './views/ReportMissingPage';
import './index.css';
import { Toaster } from 'react-hot-toast';
import ReportFoundPage from './views/ReportFoundPage';
import SearchPage from './views/SearchPage';
import UserDashboardPage from './views/UserDashboardPage';
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
          {/* Public / User routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/verify-email" element={<RegistrationVerificationPage />} />
          <Route path="/found" element={<FoundListPage />} />
          <Route path="/search-page" element={<SearchPage />} />
          <Route path="/report-found" element={<ReportFoundPage />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/report-missing" element={<ReportMissingPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/report-found" element={<ReportFoundPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/legal-aid" element={<LegalAidPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Add more routes here */}

          {/* Admin-only routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute>} />
          <Route path="/admin/moderation" element={<AdminRoute><AdminModerationPage /></AdminRoute>} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <Toaster
        position="top-center"
        toastOptions={{
          error: {
            duration: 5000,
          },
        }}
      />
    </div>
  );
}

// AponKhoj App
function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
