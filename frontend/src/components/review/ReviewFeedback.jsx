import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: isUser ? theme.palette.primary.light : theme.palette.grey[100],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  maxWidth: '80%',
  marginBottom: theme.spacing(2),
  alignSelf: isUser ? 'flex-end' : 'flex-start',
}));

const ReviewFeedback = ({ reviewId, threadId, onFeedbackSubmit }) => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setLoading(true);
    try {
      const response = await onFeedbackSubmit(feedback);
      setMessages(prev => [
        ...prev,
        { type: 'user', content: feedback },
        { type: 'ai', content: response.feedback_data }
      ]);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Review Feedback
      </Typography>

      {/* Messages List */}
      <StyledPaper>
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <MessageBubble isUser={message.type === 'user'}>
                  <Typography>{message.content}</Typography>
                </MessageBubble>
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </StyledPaper>

      {/* Feedback Form */}
      <StyledPaper>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Provide feedback on the review"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !feedback.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Feedback'}
          </Button>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default ReviewFeedback; 