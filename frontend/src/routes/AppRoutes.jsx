import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import UserDashboardPage from "../pages/UserDashboardPage";
import RepoRegistrationPage from "../pages/RepoRegistrationPage";
import RepoOverviewPage from "../pages/RepoOverviewPage";
import RepoSettingsPage from "../pages/RepoSettingsPage";
import PullRequestsListPage from "../pages/PullRequestsListPage";
import PullRequestDetailsPage from "../pages/PullRequestDetailsPage";
import CommitsListPage from "../pages/CommitsListPage";
import CommitDetailsPage from "../pages/CommitDetailsPage";
import CodeReviewPage from "../pages/CodeReviewPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import NotFoundPage from "../pages/NotFoundPage";
import AuthCallbackPage from "../pages/AuthCallbackPage"; // Import AuthCallbackPage
import { useAuth } from "../contexts/AuthContext";
import ReviewPage from "../pages/ReviewPage";
// Placeholder for ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth(); // Use isLoading
  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Placeholder for AdminRoute component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  // Ensure user object and is_admin property are checked
  if (!isAuthenticated || !user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />{" "}
      {/* Add callback route */}
      {/* Protected Routes (require authentication) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <UserDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register-repo"
        element={
          <ProtectedRoute>
            <RepoRegistrationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/repo/:repoId/overview"
        element={
          <ProtectedRoute>
            <RepoOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review/:reviewId"
        element={
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/repo/:repoId/settings"
        element={
          <ProtectedRoute>
            <RepoSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/repo/:repoId/pulls"
        element={
          <ProtectedRoute>
            <PullRequestsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/repo/:repoId/pulls/:prNumber"
        element={
          <ProtectedRoute>
            <PullRequestDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/repo/:repoId/commits"
        element={
          <ProtectedRoute>
            <CommitsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/repo/:repoId/commits/:commitSha"
        element={
          <ProtectedRoute>
            <CommitDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review/:reviewId"
        element={
          <ProtectedRoute>
            <CodeReviewPage />
          </ProtectedRoute>
        }
      />
      {/* Admin Routes (require authentication and admin role) */}
      {/* TODO: Update user.role check based on your actual user object structure */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      {/* Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
