import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Grid,
  Tabs,
  Tab,
  Rating,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Snackbar,
} from "@mui/material";
import ReviewReport from "../components/review/ReviewReport";
import ThreadList from "../components/review/ThreadList";
import { reviewService } from "../services/reviewService";
import { SmartToy as AIIcon } from "@mui/icons-material";

const ReviewPage = () => {
  const { reviewId } = useParams();
  const [reviewData, setReviewData] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // AI rating state
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [ratingError, setRatingError] = useState(null);
  const [currentDisplayedReview, setCurrentDisplayedReview] = useState(null);
  // Fetch initial data
  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getReview(reviewId); // Fetches from /reviews/{reviewId}/
        setReviewData(data); // Store the full original response if needed elsewhere

        // Initialize currentDisplayedReview with the main review content
        // Based on your API: data.review_data.final_result
        if (data && data.review_data && data.review_data.final_result) {
          setCurrentDisplayedReview(data.review_data.final_result);
        } else {
          // Fallback or error if structure is not as expected
          console.warn("Initial review data structure not as expected:", data);
          setCurrentDisplayedReview(data.review_data || null); // Or handle error
        }

        await fetchReviewThreads();
      } catch (err) {
        setError(
          "Failed to load review data: " +
            (err.response?.data?.detail || err.message)
        );
        console.error("Error fetching review:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [reviewId]);

  // Fetch threads function (can be called after updates)
  const fetchReviewThreads = async () => {
    try {
      const threadsData = await reviewService.getReviewThreads(reviewId);
      setThreads(threadsData);
    } catch (err) {
      console.error("Error fetching threads:", err);
      // Don't set the main error state to allow partial loading
    }
  };

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle thread replies
  const handleThreadReply = async (threadId, message) => {
    try {
      const replyResponse = await reviewService.replyToThread(
        // there should a selected thread state
        threads[0].comments.length > 0 ? threads[0].comments[0]?.id : null,
        threadId,
        message
      );
      // Refresh threads after reply
      await fetchReviewThreads();

      // Update the displayed review if the AI provided an updated version
      if (
        replyResponse &&
        replyResponse.ai_response &&
        replyResponse.ai_response.comment_data
      ) {
        const aiCommentData = replyResponse.ai_response.comment_data;
        if (aiCommentData.updated_review) {
          setCurrentDisplayedReview(aiCommentData.updated_review);
          console.log(
            "Review display updated based on AI feedback:",
            aiCommentData.updated_review
          );
        }
      }
    } catch (err) {
      console.error("Error replying to thread:", err);
      throw err;
    }
  };

  // Handle AI rating submission
  const handleRatingSubmit = async () => {
    if (rating === 0) {
      setRatingError("Please select a rating");
      return;
    }

    if (!feedbackText.trim()) {
      setRatingError("Please provide feedback");
      return;
    }

    setRatingSubmitting(true);
    setRatingError(null);

    try {
      await reviewService.submitAiRating(reviewId, rating, feedbackText);
      setRatingSuccess(true);
      setRating(0);
      setFeedbackText("");
    } catch (err) {
      setRatingError(
        "Failed to submit rating: " +
          (err.response?.data?.detail || err.message)
      );
      console.error("Error submitting rating:", err);
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Close success message
  const handleCloseSuccess = () => {
    setRatingSuccess(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Code Review {reviewData?.id && `#${reviewData.id}`}
        </Typography>

        <Typography variant="body2" color="textSecondary" gutterBottom>
          Status: <strong>{reviewData?.status || "Unknown"}</strong> • Created:{" "}
          <strong>
            {reviewData?.created_at &&
              new Date(reviewData.created_at).toLocaleString()}
          </strong>
          {reviewData?.repository &&
            ` • Repository: ${reviewData.repository.repo_name}`}
        </Typography>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Review Report" />
          <Tab
            label={`Conversations (${threads.length})`}
            disabled={threads.length === 0}
          />
          <Tab label="Rate AI" />
        </Tabs>
      </Paper>

      {/* Review Report Tab */}
      {activeTab === 0 && (
        <Box>
          <ReviewReport
            reviewData={currentDisplayedReview}
            loading={!currentDisplayedReview && loading} // Pass appropriate loading state
          />
        </Box>
      )}

      {/* Threads Tab */}
      {activeTab === 1 && (
        <Box>
          <ThreadList
            threads={threads}
            onReply={handleThreadReply}
            loading={false}
          />
        </Box>
      )}

      {/* Rate AI Tab */}
      {activeTab === 2 && (
        <Card>
          <CardHeader
            title="Rate the AI Review Quality"
            subheader="Your feedback helps improve our AI code review capabilities"
            avatar={<AIIcon color="primary" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="body1" gutterBottom>
                    How would you rate the quality of this AI review?
                  </Typography>
                  <Rating
                    name="ai-rating"
                    value={rating}
                    onChange={(e, newValue) => setRating(newValue)}
                    size="large"
                    sx={{ fontSize: "2.5rem", my: 2 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {rating === 1
                      ? "Poor"
                      : rating === 2
                      ? "Fair"
                      : rating === 3
                      ? "Good"
                      : rating === 4
                      ? "Very Good"
                      : rating === 5
                      ? "Excellent"
                      : "Select a rating"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Your feedback about the review"
                  placeholder="What did you like or dislike about the review? How could it be improved?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  disabled={ratingSubmitting}
                  sx={{ mb: 3 }}
                />
              </Grid>

              {ratingError && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {ratingError}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRatingSubmit}
                  disabled={
                    ratingSubmitting || rating === 0 || !feedbackText.trim()
                  }
                >
                  {ratingSubmitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Submit Rating"
                  )}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={ratingSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        message="Thank you for your feedback!"
      />
    </Container>
  );
};

export default ReviewPage;
