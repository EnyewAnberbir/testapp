import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { prService } from "../services/apiService";
import { reviewService } from "../services/reviewService";
import {
  Button,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  CheckCircle,
  AccessTime,
  Error as ErrorIcon,
} from "@mui/icons-material";

function PullRequestDetailsPage() {
  const { repoId, prNumber } = useParams();
  const navigate = useNavigate();

  const [pr, setPr] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerError, setTriggerError] = useState(null);
  const [triggerSuccess, setTriggerSuccess] = useState(null);

  // Fetch PR details
  useEffect(() => {
    if (repoId && prNumber) {
      setLoading(true);
      prService
        .getPullRequestDetailsByNumber(repoId, prNumber)
        .then((res) => {
          setPr(res.data);
          setError(null);
          // Once we have the PR details, fetch its reviews
          fetchReviewHistory(res.data.id);
          //if pr is not registered in db then don't even make this call
          // with pr id
        })
        .catch((e) => {
          setError(
            e.response?.data?.detail ||
              e.message ||
              "Failed to load PR details."
          );
          setPr(null);
        })
        .finally(() => setLoading(false));
    }
  }, [repoId, prNumber]);

  // Fetch review history for this PR
  const fetchReviewHistory = (prId) => {
    setReviewsLoading(true);
    reviewService
      .getReviewHistory("pr", prId)
      .then((data) => {
        setReviews(data);
      })
      .catch((error) => {
        console.error("Error fetching review history:", error);
      })
      .finally(() => {
        setReviewsLoading(false);
      });
  };

  // Handle manual review trigger
  const handleTriggerReview = () => {
    if (!pr || pr.pr_number === undefined || pr.repository.id === undefined) {
      console.error("Missing PR data for triggering review. PR object:", pr);
      setTriggerError(
        "Cannot trigger review: essential PR data (repository ID or PR number) is missing."
      );
      setTriggerLoading(false); // Ensure loading is reset
      return;
    }

    setTriggerLoading(true);
    setTriggerError(null);
    setTriggerSuccess(null);

    reviewService
      .triggerPrReview(pr.repository.id, pr.pr_number) // MODIFIED: Pass repository_id and pr_number
      .then((response) => {
        setTriggerSuccess(
          `AI review started successfully. Review ID: ${response.review_id}`
        );
        // Refresh the review list
        if (pr.id) {
          // pr.id is the PullRequest model's database ID
          fetchReviewHistory(pr.id);
        } else {
          console.warn(
            "PR ID not available to refresh review history after triggering."
          );
        }
      })
      .catch((error) => {
        setTriggerError(
          error.response?.data?.detail || "Failed to trigger review."
        );
      })
      .finally(() => {
        setTriggerLoading(false);
      });
  };

  // Navigate to review details
  const handleViewReview = (reviewId) => {
    navigate(`/review/${reviewId}`);
  };

  // Get status color and icon
  const getStatusDetails = (status) => {
    switch (status) {
      case "completed":
        return {
          color: "success.main",
          icon: <CheckCircle />,
          chipColor: "success",
        };
      case "in_progress":
      case "pending":
      case "pending_analysis":
      case "processing":
        return {
          color: "warning.main",
          icon: <AccessTime />,
          chipColor: "warning",
        };
      case "failed":
        return { color: "error.main", icon: <ErrorIcon />, chipColor: "error" };
      default:
        return { color: "text.secondary", icon: null, chipColor: "default" };
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!pr) return <Alert severity="warning">Pull Request not found.</Alert>;

  // const canTriggerReview = pr.status === 'open' &&
  //   (!reviews.length || !reviews.some(r => ['completed', 'in_progress', 'pending'].includes(r.status)));
  const canTriggerReview = true;
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          PR #{pr.pr_number}: {pr.title}
        </Typography>

        <Typography variant="body1">
          <strong>Status:</strong> {pr.status}
        </Typography>

        <Typography variant="body1">
          <strong>Author:</strong> {pr.user_login || pr.author_github_id}
        </Typography>

        {pr.body && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Description
            </Typography>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                  }}
                >
                  {pr.body}
                </Typography>
              </CardContent>
            </Card>
          </>
        )}

        <Button
          variant="outlined"
          component="a"
          href={pr.url || pr.html_url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mr: 2, mb: 2 }}
        >
          View on GitHub
        </Button>

        <Button
          variant="outlined"
          component={Link}
          to={`/repo/${pr.repository.github_native_id}/overview`}
          sx={{ mb: 2 }}
        >
          ← Back to Repository
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>
          AI Code Reviews
        </Typography>

        {triggerError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {triggerError}
          </Alert>
        )}

        {triggerSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {triggerSuccess}
          </Alert>
        )}

        {canTriggerReview ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleTriggerReview}
            disabled={triggerLoading}
            sx={{ mb: 3 }}
          >
            {triggerLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Trigger AI Review"
            )}
          </Button>
        ) : (
          reviews.some((r) =>
            ["completed", "in_progress", "pending"].includes(r.status)
          ) && (
            <Alert severity="info" sx={{ mb: 3 }}>
              A review is already in progress or completed for this PR.
            </Alert>
          )
        )}

        {reviewsLoading ? (
          <CircularProgress />
        ) : reviews.length > 0 ? (
          <List>
            {reviews.map((review) => {
              const { color, icon, chipColor } = getStatusDetails(
                review.status
              );
              return (
                <ListItem
                  key={review.id}
                  button
                  onClick={() => handleViewReview(review.id)}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        Review from{" "}
                        {new Date(review.created_at).toLocaleString()}
                        <Chip
                          label={review.status}
                          color={chipColor}
                          size="small"
                          icon={icon}
                          sx={{ ml: 2 }}
                        />
                      </Typography>
                    }
                    secondary={`Review ID: ${review.id}`}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Alert severity="info">
            No reviews have been generated for this PR yet.
          </Alert>
        )}
      </Grid>
    </Grid>
  );
}

export default PullRequestDetailsPage;
