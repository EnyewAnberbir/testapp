import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
const apiClient = axios.create({
  baseURL: API_URL,
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
export const reviewService = {
  // Get review details
  getReview: async (reviewId) => {
    try {
      const response = await apiClient.get(`/reviews/${reviewId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  },

  // Get review history
  getReviewHistory: async (context, id) => {
    try {
      const response = await apiClient.get(`/reviews/history/`, {
        params: { context:context, id:id }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching review history:', error);
      throw error;
    }
  },

  // Submit feedback for a review
  submitFeedback: async (reviewId, feedback) => {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/feedback/`, {
        feedback
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Request a re-review
  requestReReview: async (reviewId, issues) => {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/re-review/`, {
        issues
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting re-review:', error);
      throw error;
    }
  },

  // Get review threads
  getReviewThreads: async (reviewId) => {
    try {
      const response = await apiClient.get(`/reviews/${reviewId}/threads/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review threads:', error);
      throw error;
    }
  },

  // Reply to a thread
  replyToThread: async (commentId, threadId, message) => {
    try {
      const response = await apiClient.post(
        `/threads/${threadId}/reply/`,
        { message,
          parent_comment_id: commentId
         }
      );
      return response.data;
    } catch (error) {
      console.error('Error replying to thread:', error);
      throw error;
    }
  },

  // Get LLM usage statistics
  getLLMUsage: async () => {
    try {
      const response = await apiClient.get(`/llm-usage/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching LLM usage:', error);
      throw error;
    }
  },

  // Manually trigger a review for a pull request
  triggerPrReview: async (repositoryId, prNumber) => {
    try {
      const response = await apiClient.post(`/pull-requests/trigger-review/`, {
        repository_id: repositoryId,
        pr_number: prNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering PR review:', error);
      throw error;
    }
  },

  // Manually trigger a review for a commit
  triggerCommitReview: async (commitId) => {
    try {
      const response = await apiClient.post(`${API_URL}/commits/${commitId}/trigger_review/`);
      return response.data;
    } catch (error) {
      console.error('Error triggering commit review:', error);
      throw error;
    }
  },

  // Submit a rating for the AI review quality
  submitAiRating: async (reviewId, rating, feedbackText) => {
    try {
      const response = await apiClient.post(`${API_URL}/reviews/${reviewId}/submit_ai_rating/`, {
        rating,
        feedback: feedbackText
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting AI rating:', error);
      throw error;
    }
  }
}; 