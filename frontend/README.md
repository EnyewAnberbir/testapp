# Frontend Application for API Testing

This project is a React application created with Vite to test and interact with the backend API.

## Project Structure

- `public/`: Static assets.
- `src/`: Source code.
  - `assets/`: Images, fonts, etc.
  - `components/`: Reusable UI components (e.g., Navbar).
  - `contexts/`: React contexts for global state management (e.g., AuthContext).
  - `hooks/`: Custom React hooks.
  - `pages/`: Top-level page components corresponding to different views/routes.
  - `routes/`: Routing configuration (AppRoutes.jsx).
  - `services/`: API interaction logic (apiService.js).
  - `utils/`: Utility functions.
- `App.css`: Global application styles.
- `App.jsx`: Main application component.
- `index.css`: Base CSS styles.
- `main.jsx`: Entry point of the application.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Backend API URL**:
    Open `src/services/apiService.js` and update `API_BASE_URL` to point to your backend server.
    ```javascript
    const API_BASE_URL = 'http://localhost:YOUR_BACKEND_PORT/api'; // Update this line
    ```

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically on `http://localhost:5173`.

## Key Features to Implement (TODOs)

-   **Authentication (`src/pages/LoginPage.jsx`, `src/contexts/AuthContext.jsx`):**
    -   Implement GitHub OAuth flow.
    -   Securely store and manage the GitHub access token.
    -   Fetch user details, repositories, and organizations after authentication.
-   **User Dashboard (`src/pages/UserDashboardPage.jsx`):**
    -   Display user-owned, collaborator, and registered repositories.
    -   Implement filtering and repository selection logic.
-   **Repository Registration (`src/pages/RepoRegistrationPage.jsx`):**
    -   Create form for code standards, evaluation metrics, and LLM model selection.
    -   Generate and display webhook URL with instructions.
-   **Repository Overview (`src/pages/RepoOverviewPage.jsx`):**
    -   Display repository details, PRs, commits, collaborators, and webhook status.
    -   Implement filtering for PRs and commits.
    -   Differentiate views and actions for owners vs. collaborators.
-   **Repository Settings (`src/pages/RepoSettingsPage.jsx`):**
    -   Allow owners to edit repository settings.
-   **Pull Requests & Commits Pages (`src/pages/PullRequestsListPage.jsx`, `src/pages/PullRequestDetailsPage.jsx`, `src/pages/CommitsListPage.jsx`, `src/pages/CommitDetailsPage.jsx`):**
    -   List and detail PRs and commits with filtering.
    -   Implement manual review triggering logic.
-   **Code Review Page (`src/pages/CodeReviewPage.jsx`):**
    -   Display detailed code review information.
    -   Implement actions like re-review requests, feedback submission, and AI re-review.
-   **Admin Dashboard (`src/pages/AdminDashboardPage.jsx`):**
    -   Display system-wide statistics.
    -   Implement management features for users, repositories, and system settings.
-   **API Integration (`src/services/apiService.js`):**
    -   Implement functions to call all necessary backend endpoints.
-   **Protected Routes (`src/routes/AppRoutes.jsx`):**
    -   Refine `ProtectedRoute` and `AdminRoute` based on actual authentication and user role logic.

## Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the app for production.
-   `npm run lint`: Lints the codebase.
-   `npm run preview`: Serves the production build locally for testing.
