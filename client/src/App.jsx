import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Accounts from "./pages/Accounts/Accounts";
import Posts from "./pages/Posts/Posts";
import Calendar from "./pages/Calendar/Calendar";
import Analytics from "./pages/Analytics/Analytics";
import BioList from "./pages/Bio/BioList";
import BioEditor from "./pages/Bio/BioEditor";
import BioPageView from "./pages/Bio/BioPageView";
import Links from "./pages/Links/Links";
import TeamList from "./pages/Teams/TeamList";
import TeamDashboard from "./pages/Teams/TeamDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import PrivacySettings from "./pages/Settings/PrivacySettings";

const queryClient = new QueryClient();

// Protected route component with Layout
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

function AppContent() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
