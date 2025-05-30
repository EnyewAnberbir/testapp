import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  commitService,
} from "../services/apiService";
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
  Chip
} from "@mui/material";
import { CheckCircle, AccessTime, Error as ErrorIcon } from "@mui/icons-material";

function CommitDetailsPage() {
  const { repoId, commitSha } = useParams();
  const navigate = useNavigate();
  
  const [commit, setCommit] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerError, setTriggerError] = useState(null);
  const [triggerSuccess, setTriggerSuccess] = useState(null);

  // Fetch commit details
  useEffect(() => {
    if (repoId && commitSha) {
      setLoading(true);
      commitService
        .getCommitDetailsBySha(repoId, commitSha)
        .then((res) => {
          setCommit(res.data);
          setError(null);
          // Once we have the commit details, fetch its reviews
          fetchReviewHistory(res.data.id);
        })
        .catch((e) => {
          setError(
            e.response?.data?.detail ||
              e.message ||
              "Failed to load commit details."
          );
          setCommit(null);
        })
        .finally(() => setLoading(false));
    }
  }, [repoId, commitSha]);

  // Fetch review history for this commit
  const fetchReviewHistory = (commitId) => {
    setReviewsLoading(true);
    reviewService.getReviewHistory('commit', commitId)
      .then(data => {
        setReviews(data);
      })
      .catch(error => {
        console.error("Error fetching review history:", error);
      })
      .finally(() => {
        setReviewsLoading(false);
      });
  };

  // Handle manual review trigger
  const handleTriggerReview = () => {
    if (!commit || !commit.id) return;
    
    setTriggerLoading(true);
    setTriggerError(null);
    setTriggerSuccess(null);
    
    reviewService.triggerCommitReview(commit.id)
      .then(response => {
        setTriggerSuccess(`AI review started successfully. Review ID: ${response.review_id}`);
        // Refresh the review list
        fetchReviewHistory(commit.id);
      })
      .catch(error => {
        setTriggerError(error.response?.data?.detail || "Failed to trigger review.");
      })
      .finally(() => {
        setTriggerLoading(false);
      });
  };

  // Navigate to review details
  const handleViewReview = (reviewId) => {
    navigate(`/reviews/${reviewId}`);
  };

  // Get status color and icon
  const getStatusDetails = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'success.main', icon: <CheckCircle />, chipColor: 'success' };
      case 'in_progress':
      case 'pending':
      case 'pending_analysis':
      case 'processing':
        return { color: 'warning.main', icon: <AccessTime />, chipColor: 'warning' };
      case 'failed':
        return { color: 'error.main', icon: <ErrorIcon />, chipColor: 'error' };
      default:
        return { color: 'text.secondary', icon: null, chipColor: 'default' };
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!commit) return <Alert severity="warning">Commit not found.</Alert>;

  const canTriggerReview = !reviews.length || 
    !reviews.some(r => ['completed', 'in_progress', 'pending'].includes(r.status));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Commit {commit.commit_hash?.substring(0, 7) || commitSha.substring(0, 7)}
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Message
        </Typography>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography 
              variant="body2" 
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace"
              }}
            >
              {commit.message}
            </Typography>
          </CardContent>
        </Card>
        
        <Typography variant="body1" gutterBottom>
          <strong>Author:</strong> {commit.author_name || commit.author_github_id} ({commit.author_email})
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>Committer:</strong> {commit.committer_name || commit.committer_github_id} ({commit.committer_email})
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>Timestamp:</strong> {new Date(commit.timestamp || commit.committed_date || commit.author_date).toLocaleString()}
        </Typography>
        
        <Button 
          variant="outlined" 
          component="a"
          href={commit.url || commit.html_url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mr: 2, mb: 2 }}
        >
          View on GitHub
        </Button>
        
        <Button 
          variant="outlined" 
          component={Link} 
          to={`/repo/${repoId}/overview`}
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
            {triggerLoading ? <CircularProgress size={24} /> : "Trigger AI Review"}
          </Button>
        ) : (
          reviews.some(r => ['completed', 'in_progress', 'pending'].includes(r.status)) && (
            <Alert severity="info" sx={{ mb: 3 }}>
              A review is already in progress or completed for this commit.
            </Alert>
          )
        )}
        
        {reviewsLoading ? (
          <CircularProgress />
        ) : reviews.length > 0 ? (
          <List>
            {reviews.map((review) => {
              const { color, icon, chipColor } = getStatusDetails(review.status);
              return (
                <ListItem 
                  key={review.id}
                  button
                  onClick={() => handleViewReview(review.id)}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        Review from {new Date(review.created_at).toLocaleString()}
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
          <Alert severity="info">No reviews have been generated for this commit yet.</Alert>
        )}
      </Grid>
    </Grid>
  );
}

export default CommitDetailsPage;
