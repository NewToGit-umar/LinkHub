import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import Layout from "./components/Layout";
import LandingPage from "./pages/Landing/LandingPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Accounts from "./pages/Accounts/Accounts";
import Posts from "./pages/Posts/Posts";
import Calendar from "./pages/Calendar/Calendar";
import Analytics from "./pages/Analytics/Analytics";
import BioList from "./pages/Bio/BioList";
import BioEditor from "./pages/Bio/BioEditor";
import BioPageView from "./pages/Bio/BioPageView";
import PublicProfile from "./pages/Profile/PublicProfile";
import Links from "./pages/Links/Links";
import TeamList from "./pages/Teams/TeamList";
import TeamDashboard from "./pages/Teams/TeamDashboard";
import JoinTeam from "./pages/Teams/JoinTeam";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import PrivacySettings from "./pages/Settings/PrivacySettings";
import Profile from "./pages/Profile/Profile";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import TermsOfService from "./pages/Legal/TermsOfService";
import Contact from "./pages/Legal/Contact";
import { NotificationToast } from "./components/NotificationToast";

const queryClient = new QueryClient();

// Protected route component with Layout
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/" replace />;
};

// Public route - redirects to dashboard if already logged in
const PublicRoute = ({ children, allowAuthenticated = false }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow authenticated users to view if allowAuthenticated is true
  if (allowAuthenticated) {
    return children;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-black to-emerald-900 text-white">
      <Routes>
        {/* Landing page - accessible to everyone including logged-in users */}
        <Route
          path="/"
          element={
            <PublicRoute allowAuthenticated={true}>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        {/* Legal Pages - Public access without redirect */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <Posts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bio"
          element={
            <ProtectedRoute>
              <BioList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bio/new"
          element={
            <ProtectedRoute>
              <BioEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bio/edit/:slug"
          element={
            <ProtectedRoute>
              <BioEditor />
            </ProtectedRoute>
          }
        />
        {/* Public bio page view */}
        <Route path="/p/:slug" element={<BioPageView />} />
        {/* Public profile view - shareable link */}
        <Route path="/u/:username" element={<PublicProfile />} />
        {/* Team invite link - join via shareable link */}
        <Route path="/join/:slug/:code" element={<JoinTeam />} />
        <Route
          path="/links"
          element={
            <ProtectedRoute>
              <Links />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <TeamList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <TeamList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:slug"
          element={
            <ProtectedRoute>
              <TeamDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/privacy"
          element={
            <ProtectedRoute>
              <PrivacySettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* Catch-all redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
      <NotificationToast />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
