import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1'; // Updated backend URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set Authorization header once token is available
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('githubToken'); // Or get from AuthContext
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// TODO: Define placeholder functions for each backend API endpoint

// Example Authentication service (adjust based on your backend)
export const authService = {
  // This function might be used if frontend gets the code directly,
  // but primary flow is backend redirecting with token.
  exchangeCodeForToken: (code) => apiClient.post('/auth/github', { code }),
  getCurrentUser: () => apiClient.get('/user'), // Corrected path
  getUserOrganizations: (page = 1, perPage = 30) => apiClient.get('/user/organizations', { params: { page, per_page: perPage } }), // Added pagination
  refreshToken: () => apiClient.post('/auth/refresh'), // Added
};

// Example Repository services
export const repoService = {
  // This fetches all repos user has access to (owned, collaborator, org member)
  // Frontend will need to filter based on permissions if needed.
  getUserRepositories: (page = 1, perPage = 30) => apiClient.get('/user/repos', { params: { page, per_page: perPage } }), // Added pagination
  registerRepository: (data) => {
    console.log("Registering repository with data:", data);
    return apiClient.post('/repositories/', data)
  },
  getRepositoryDetails: (repoId) => apiClient.get(`/repositories/${repoId}`), // This fetches by internal ID
  getRepositoryDetailsByGithubId: (githubId) => apiClient.get(`/repositories/by-github-id/${githubId}`), // New service
  updateRepositorySettings: (repoId, data) => apiClient.put(`/repositories/${repoId}/`, data), // Corrected path
  deleteRepository: (repoId) => apiClient.delete(`/repositories/${repoId}/`), // Added
  getRepoCollaborators: (repoId, page = 1, perPage = 30) => apiClient.get(`/repositories/${repoId}/collaborators`, { params: { page, per_page: perPage } }), // Added pagination
  getRegisteredRepoCollaborators: (repoId) => apiClient.get(`/repositories/${repoId}/registered-collaborators`), // Added based on backend
  regenerateWebhook: (repoId) => apiClient.post(`/repositories/${repoId}/webhook/regenerate`), // Added based on backend placeholder
  getWebhookStatus: (repoId) => apiClient.get(`/repositories/${repoId}/webhook/status`), // Added based on backend placeholder
};

// Example PR services
export const prService = {
  getPullRequests: (repoId, filters) => apiClient.get('/pull-requests', { params: { ...filters, repo_id: repoId } }), // Corrected path and params
  getPullRequestDetailsByNumber: (repoId, prNumber) => apiClient.get(`/repositories/${repoId}/pulls/${prNumber}`), 
  triggerManualReview: (prId) => apiClient.post(`/pull-requests/${prId}/trigger_review`), // Corrected path
  approvePullRequest: (prId) => apiClient.post(`/pull-requests/${prId}/approve`), // Corrected path
};

// Example Commit services
export const commitService = {
  getCommits: (repoId, filters) => apiClient.get('/commits', { params: { ...filters, repo_id: repoId } }), // Corrected path and params
  getCommitDetailsBySha: (repoId, commitSha) => apiClient.get(`/repositories/${repoId}/commits/sha/${commitSha}`),
  triggerCommitReview: (commitId) => apiClient.post(`/commits/${commitId}/trigger_review`),
};

// Example Code Review services
export const reviewService = {
  getReviews: (filters) => apiClient.get('/reviews', { params: filters }), // Added (e.g., filters = { repo_id, status, date_from, date_to })
  getCodeReviewDetails: (reviewId) => apiClient.get(`/reviews/${reviewId}`),
  requestReReview: (reviewId,issues) => apiClient.post(`/reviews/${reviewId}/re-review`,{issues}),
  // Expects data = { rating: number, feedback: string }
  submitFeedback: (reviewId, data) => apiClient.post(`/reviews/${reviewId}/feedback`, data),
  // For interacting with LangGraph threads associated with a review
  getReviewThreads: (reviewId) => apiClient.get(`/reviews/${reviewId}/threads`),
  // Expects feedbackData = { feedback: "user's message", ...any other required fields by backend for ReviewFeedback schema }
  createReviewThread: (reviewId, feedbackData) => apiClient.post(`/reviews/${reviewId}/threads`, feedbackData),
  // Expects feedbackData = { feedback: "user's reply", ... }
  replyToReviewThread: (threadId, message) => apiClient.post(`/threads/${threadId}/reply`, {message,parent_comment_id:reviewId}),
  getReviewHistory: (context, id) => apiClient.get('/reviews/history', { params: { context, id } }),
};

// Example Admin services
export const adminService = {
  getSystemStats: () => apiClient.get('/admin/stats'),
  manageUsers: () => apiClient.get('/admin/users'),
  updateUser: (userId, userData) => apiClient.put(`/admin/users/${userId}`, userData),
  getSystemLogs: () => apiClient.get('/admin/logs'), // Added
};

// Added for LLM Usage
export const usageService = {
  getLlmUsage: () => apiClient.get('/llm-usage'),
};

export const webhookService = {
    // Webhook URL is part of repo details. Specific status/regenerate might be added if backend implements them.
    regenerateWebhook: (repoId) => apiClient.post(`/repositories/${repoId}/webhook/regenerate`), // Added based on backend placeholder
    getWebhookStatus: (repoId) => apiClient.get(`/repositories/${repoId}/webhook/status`), // Added based on backend placeholder
};

export default apiClient;
