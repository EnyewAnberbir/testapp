import { createBrowserRouter } from "react-router-dom";

// Import Page Components
import LoginPage from "../pages/LoginPage";
import UserDashboardPage from "../pages/UserDashboardPage";
import AuthCallbackPage from "../pages/AuthCallbackPage";
// import AuthErrorPage from "../pages/AuthErrorPage"; // Ensure this page exists
import RepoRegistrationPage from "../pages/RepoRegistrationPage";
import RepoOverviewPage from "../pages/RepoOverviewPage";
import RepoSettingsPage from "../pages/RepoSettingsPage";
import PullRequestsListPage from "../pages/PullRequestsListPage";
import PullRequestDetailsPage from "../pages/PullRequestDetailsPage";
import CommitsListPage from "../pages/CommitsListPage";
import CommitDetailsPage from "../pages/CommitDetailsPage";
import CodeReviewPage from "../pages/CodeReviewPage"; // Using CodeReviewPage for /review/:reviewId
import ReviewPage from "../pages/ReviewPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
// import ProfilePage from "../pages/ProfilePage"; // Ensure this page exists
import LLMUsagePage from "../pages/LLMUsagePage";
import NotFoundPage from "../pages/NotFoundPage";
// import ReviewPage from "../pages/ReviewPage"; // If ReviewPage is different and needed for another path

// const Layout = () => ( /* ... your layout component ... */ ); // If you plan to use a root layout
import Layout from "../components/Layout"; // Import the new Layout component

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />, // LoginPage likely doesn't need the main Navbar
  },
  {
    path: "/",
    element: <Layout />, // Use Layout for the main app structure
    children: [
      {
        index: true,
        element: <UserDashboardPage />,
      },
      {
        path: "auth/callback",
        element: <AuthCallbackPage />,
      },
      // {
      //   path: "auth/error",
      //   element: <AuthErrorPage />, // Ensure AuthErrorPage is imported
      // },
      {
        path: "register-repo",
        element: <RepoRegistrationPage />,
      },
      {
        path: "repo/:repoId/overview",
        element: <RepoOverviewPage />,
      },
      {
        path: "repo/:repoId/settings",
        element: <RepoSettingsPage />,
      },
      {
        path: "repo/:repoId/pulls",
        element: <PullRequestsListPage />,
      },
      {
        path: "repo/:repoId/pulls/:prNumber",
        element: <PullRequestDetailsPage />,
      },
      {
        path: "repo/:repoId/commits",
        element: <CommitsListPage />,
      },
      {
        path: "repo/:repoId/commits/:commitSha",
        element: <CommitDetailsPage />,
      },
      {
        path: "review/:reviewId",
        element: <ReviewPage />,
      },
      {
        path: "admin",
        element: <AdminDashboardPage />,
      },
      // {
      //   path: "profile",
      //   element: <ProfilePage />, // Ensure ProfilePage is imported
      // },
      {
        path: "llm-usage",
        element: <LLMUsagePage />,
      },
      // It's good practice to have a catch-all for children of layout too,
      // or rely on a top-level catch-all if Layout is not used for all paths.
      // However, the top-level "*" below will handle paths not matching any route.
    ],
  },
  {
    path: "*", // Top-level catch-all for any routes not matched above
    element: <NotFoundPage />,
  },
]);

export default router;
