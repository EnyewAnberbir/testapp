import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  alpha,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const MessageBubble = styled(Box)(({ theme, isUser, isError }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: isError
    ? theme.palette.error.light
    : isUser
    ? theme.palette.primary.light
    : theme.palette.grey[100],
  color: isUser
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  maxWidth: "90%",
  marginBottom: theme.spacing(1),
  marginLeft: isUser ? "auto" : 0,
  marginRight: isUser ? 0 : "auto",
  boxShadow: theme.shadows[1],
  position: "relative",
  wordBreak: "break-word",
}));

const ThreadContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

const ThreadHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  maxHeight: "400px",
  overflowY: "auto",
  backgroundColor: theme.palette.background.default,
}));

const ReplyContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ThreadList = ({ threads = [], onReply, loading }) => {
  const theme = useTheme(); // Get the theme object
  const [expandedThreads, setExpandedThreads] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [replying, setReplying] = useState({});
  const messagesEndRef = useRef({});

  // Initialize expanded state for threads
  useEffect(() => {
    // Expand the most recently active thread by default
    if (threads.length > 0 && Object.keys(expandedThreads).length === 0) {
      const sortedThreads = [...threads].sort(
        (a, b) =>
          new Date(b.last_comment_at || b.created_at) -
          new Date(a.last_comment_at || a.created_at)
      );

      setExpandedThreads({ [sortedThreads[0].id]: true });
    }

    // Initialize reply texts
    const initialReplyTexts = {};
    threads.forEach((thread) => {
      if (!replyTexts[thread.id]) {
        initialReplyTexts[thread.id] = "";
      }
    });

    if (Object.keys(initialReplyTexts).length > 0) {
      setReplyTexts((prev) => ({ ...prev, ...initialReplyTexts }));
    }
  }, [threads]);

  // Scroll to bottom of messages when a thread expands or new messages arrive
  useEffect(() => {
    Object.keys(expandedThreads).forEach((threadId) => {
      if (expandedThreads[threadId] && messagesEndRef.current[threadId]) {
        messagesEndRef.current[threadId].scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [expandedThreads, threads]);

  const toggleThread = (threadId) => {
    setExpandedThreads((prev) => ({
      ...prev,
      [threadId]: !prev[threadId],
    }));
  };

  const handleReplyTextChange = (threadId, text) => {
    setReplyTexts((prev) => ({
      ...prev,
      [threadId]: text,
    }));
  };

  const handleReply = async (threadId) => {
    if (!replyTexts[threadId]?.trim()) return;

    setReplying((prev) => ({ ...prev, [threadId]: true }));

    try {
      await onReply(threadId, replyTexts[threadId]);

      // Clear the reply text after successful submission
      setReplyTexts((prev) => ({
        ...prev,
        [threadId]: "",
      }));
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setReplying((prev) => ({ ...prev, [threadId]: false }));
    }
  };

  const handleKeyPress = (e, threadId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply(threadId);
    }
  };

  // Function to render message content with code highlighting
  const renderMessageContent = (message) => {
    if (!message) return null;

    // Regular expression to detect code blocks (```language code ```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    // If no code blocks, return the plain message
    if (!codeBlockRegex.test(message)) {
      return (
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {message}
        </Typography>
      );
    }

    // Reset regex lastIndex
    codeBlockRegex.lastIndex = 0;

    // Split the message into parts (text and code blocks)
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(message)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: message.substring(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: "code",
        language: match[1] || "javascript", // Default to javascript if language not specified
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < message.length) {
      parts.push({
        type: "text",
        content: message.substring(lastIndex),
      });
    }

    // Render parts
    return parts.map((part, index) => {
      if (part.type === "text") {
        return (
          <Typography
            key={index}
            variant="body1"
            sx={{ whiteSpace: "pre-wrap", mb: 1 }}
          >
            {part.content}
          </Typography>
        );
      } else if (part.type === "code") {
        return (
          <Box key={index} sx={{ mb: 2, borderRadius: 1, overflow: "hidden" }}>
            <SyntaxHighlighter
              language={part.language}
              style={vscDarkPlus}
              customStyle={{ margin: 0 }}
            >
              {part.content}
            </SyntaxHighlighter>
          </Box>
        );
      }
      return null;
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Conversation Threads
        </Typography>
        <StyledPaper>
          <Typography variant="body1" color="textSecondary">
            No conversation threads available.
          </Typography>
        </StyledPaper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Conversation Threads
      </Typography>

      {threads.map((thread) => {
        const isExpanded = expandedThreads[thread.id] || false;
        const hasComments = thread.comments && thread.comments.length > 0;

        return (
          <ThreadContainer key={thread.id}>
            <ThreadHeader
              onClick={() => toggleThread(thread.id)}
              sx={{ cursor: "pointer" }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {thread.title || `Thread #${thread.id}`}
                </Typography>
                <Box>
                  <Chip
                    size="small"
                    label={thread.status}
                    color={thread.status === "open" ? "success" : "default"}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    size="small"
                    label={`${thread.comments?.length || 0} message${
                      thread.comments?.length !== 1 ? "s" : ""
                    }`}
                    variant="outlined"
                  />
                </Box>
              </Box>
              {thread.thread_type && (
                <Typography variant="caption" color="inherit">
                  {thread.thread_type.replace("_", " ")}
                </Typography>
              )}
            </ThreadHeader>

            {isExpanded && (
              <>
                <MessagesContainer>
                  {hasComments ? (
                    thread.comments.map((comment, index) => {
                      const isUser = comment.user?.username != "ai_assistant";
                      const isError = comment.type === "error";
                      const isAiResponse =
                        comment.user &&
                        comment.user?.username == "ai_assistant"; // Or based on comment.type === 'response'
                      if (isAiResponse && comment.comment_data) {
                        return (
                          <Box
                            mt={1}
                            p={1.5}
                            sx={{
                              borderTop: `1px dashed ${theme.palette.divider}`,
                              fontSize: "0.85em",
                              backgroundColor: alpha(
                                theme.palette.action.hover,
                                0.02
                              ),
                              borderRadius: "0 0 8px 8px", // If MessageBubble has rounded corners
                            }}
                          >
                            {comment.comment_data.feedback_status && (
                              <Typography
                                variant="caption"
                                display="block"
                                gutterBottom
                              >
                                <strong>AI Analysis:</strong>{" "}
                                {comment.comment_data.feedback_status}
                              </Typography>
                            )}
                            {comment.comment_data.feedback_explanation && (
                              <Typography
                                variant="caption"
                                display="block"
                                gutterBottom
                                sx={{ whiteSpace: "pre-wrap" }}
                              >
                                <strong>Explanation:</strong>{" "}
                                {comment.comment_data.feedback_explanation}
                              </Typography>
                            )}
                            {comment.comment_data.feedback_suggestion && (
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ whiteSpace: "pre-wrap" }}
                              >
                                <strong>Suggestion:</strong>{" "}
                                {comment.comment_data.feedback_suggestion}
                              </Typography>
                            )}
                            {/* You could add an expandable section for comment.comment_data.messages (LangGraph history) for debugging */}
                          </Box>
                        );
                      }
                      return (
                        <Box key={comment.id} mb={2}>
                          <Box
                            display="flex"
                            flexDirection={isUser ? "row-reverse" : "row"}
                            alignItems="flex-start"
                            mb={1}
                          >
                            <Avatar
                              sx={{
                                bgcolor: isUser
                                  ? "primary.main"
                                  : "secondary.main",
                                mr: isUser ? 0 : 1,
                                ml: isUser ? 1 : 0,
                              }}
                            >
                              {isUser ? <PersonIcon /> : <AIIcon />}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  ml: isUser ? 0 : 1,
                                  mr: isUser ? 1 : 0,
                                  textAlign: isUser ? "right" : "left",
                                  display: "block",
                                }}
                              >
                                {isUser ? "You" : "AI Assistant"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems={isUser ? "flex-end" : "flex-start"}
                          >
                            <MessageBubble isUser={isUser} isError={isError}>
                              {isError && (
                                <Box display="flex" alignItems="center" mb={1}>
                                  <ErrorIcon
                                    color="error"
                                    fontSize="small"
                                    sx={{ mr: 1 }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="error.dark"
                                  >
                                    Error processing request
                                  </Typography>
                                </Box>
                              )}
                              {renderMessageContent(comment.comment)}
                            </MessageBubble>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{
                                mr: isUser ? 1 : 0,
                                ml: isUser ? 0 : 1,
                              }}
                            >
                              {new Date(comment.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      align="center"
                    >
                      No messages yet. Start the conversation!
                    </Typography>
                  )}
                  <div ref={(el) => (messagesEndRef.current[thread.id] = el)} />
                </MessagesContainer>

                <ReplyContainer>
                  <Box display="flex" alignItems="flex-start">
                    <TextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={4}
                      variant="outlined"
                      placeholder="Type your message..."
                      value={replyTexts[thread.id] || ""}
                      onChange={(e) =>
                        handleReplyTextChange(thread.id, e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, thread.id)}
                      disabled={replying[thread.id]}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Tooltip title="Send message">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => handleReply(thread.id)}
                          disabled={
                            !replyTexts[thread.id]?.trim() ||
                            replying[thread.id]
                          }
                        >
                          {replying[thread.id] ? (
                            <CircularProgress size={24} />
                          ) : (
                            <SendIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </ReplyContainer>
              </>
            )}
          </ThreadContainer>
        );
      })}
    </Box>
  );
};

export default ThreadList;
