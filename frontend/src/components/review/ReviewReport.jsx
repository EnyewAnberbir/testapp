import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Chip,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  InsertDriveFile as FileIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle,
  RuleFolder as RuleIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const IssueCard = styled(Card)(({ theme, severity }) => ({
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${
    severity === "critical"
      ? theme.palette.error.main
      : severity === "warning"
      ? theme.palette.warning.main
      : theme.palette.info.main
  }`,
}));

const SidebarNav = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: theme.spacing(2),
  maxHeight: "calc(100vh - 100px)",
  overflowY: "auto",
  paddingRight: theme.spacing(1),
}));

const FileHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  borderLeft: `5px solid ${theme.palette.primary.main}`,
}));

const ScoreRating = ({ label, score, color }) => (
  <Box mb={1}>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={4}>
        <Typography variant="body2">{label}</Typography>
      </Grid>
      <Grid item xs={8}>
        <LinearProgress
          variant="determinate"
          value={score * 10}
          color={color || "primary"}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Grid>
    </Grid>
  </Box>
);

const ReviewReport = ({ reviewData, loading }) => {
  const [activeSection, setActiveSection] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    if (reviewData && reviewData.review && reviewData.review.final.length > 0) {
      // Set the first file as active by default
      setActiveSection(reviewData.review.final[0].file);
    }
  }, [reviewData]);

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

  if (!reviewData || !reviewData.review) {
    return (
      <Typography variant="h6" color="error">
        No review data available
      </Typography>
    );
  }

  // Helper function to scroll to a section
  const scrollToSection = (fileId) => {
    setActiveSection(fileId);
    if (sectionRefs.current[fileId]) {
      sectionRefs.current[fileId].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Count issues for summary
  const criticalCount = reviewData.review.final.reduce(
    (sum, file) => sum + file.critical_issues.length,
    0
  );

  const warningCount = reviewData.review.syntax.reduce(
    (sum, file) => sum + (file.issues?.length || 0),
    0
  );

  const standardsCount = reviewData.review.standards.reduce(
    (sum, file) => sum + (file.issues?.length || 0),
    0
  );

  // Count files with critical issues
  const filesWithCriticalIssues = reviewData.review.final
    .filter((file) => file.critical_issues.length > 0)
    .map((file) => ({
      file: file.file,
      count: file.critical_issues.length,
    }));

  return (
    <Box>
      {/* Summary Section */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardHeader
          title="Review Summary"
          sx={{
            backgroundColor: "primary.light",
            color: "primary.contrastText",
          }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              <Box display="flex" gap={3} mb={3}>
                <Box textAlign="center">
                  <Badge
                    badgeContent={criticalCount}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 18,
                        height: 30,
                        minWidth: 30,
                      },
                    }}
                  >
                    <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                  </Badge>
                  <Typography variant="body2" mt={1}>
                    Critical Issues
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Badge
                    badgeContent={warningCount}
                    color="warning"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 18,
                        height: 30,
                        minWidth: 30,
                      },
                    }}
                  >
                    <WarningIcon color="warning" sx={{ fontSize: 40 }} />
                  </Badge>
                  <Typography variant="body2" mt={1}>
                    Warnings
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Badge
                    badgeContent={standardsCount}
                    color="info"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 18,
                        height: 30,
                        minWidth: 30,
                      },
                    }}
                  >
                    <RuleIcon color="info" sx={{ fontSize: 40 }} />
                  </Badge>
                  <Typography variant="body2" mt={1}>
                    Standards Issues
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Files with Critical Issues
              </Typography>
              {filesWithCriticalIssues.length > 0 ? (
                <List dense>
                  {filesWithCriticalIssues.map((item, index) => (
                    <ListItem
                      key={index}
                      button
                      onClick={() => scrollToSection(item.file)}
                    >
                      <ListItemIcon>
                        <FileIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.file}
                        secondary={`${item.count} critical issue${
                          item.count !== 1 ? "s" : ""
                        }`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="success.main">
                  <CheckCircle sx={{ verticalAlign: "middle", mr: 1 }} />
                  No critical issues found!
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Sidebar Navigation */}
        <Grid item xs={12} md={3}>
          <SidebarNav>
            <Typography variant="h6" gutterBottom>
              Files
            </Typography>
            <List component="nav" dense>
              {reviewData.review.final.map((fileData, index) => {
                // Count issues for this file
                const criticalCount = fileData.critical_issues.length;
                const syntaxFile = reviewData.review.syntax.find(
                  (f) => f.file === fileData.file
                );
                const syntaxCount = syntaxFile
                  ? syntaxFile.issues?.length || 0
                  : 0;
                const standardsFile = reviewData.review.standards.find(
                  (f) => f.file === fileData.file
                );
                const standardsCount = standardsFile
                  ? standardsFile.issues?.length || 0
                  : 0;
                const totalIssues =
                  criticalCount + syntaxCount + standardsCount;

                return (
                  <ListItem
                    key={index}
                    button
                    selected={activeSection === fileData.file}
                    onClick={() => scrollToSection(fileData.file)}
                    sx={{
                      borderLeft:
                        activeSection === fileData.file ? "3px solid" : "none",
                      borderColor: "primary.main",
                      bgcolor:
                        activeSection === fileData.file
                          ? "action.selected"
                          : "transparent",
                    }}
                  >
                    <ListItemIcon>
                      <Badge
                        badgeContent={totalIssues}
                        color={criticalCount > 0 ? "error" : "warning"}
                      >
                        <FileIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={fileData.file.split("/").pop()}
                      secondary={fileData.file}
                      secondaryTypographyProps={{
                        noWrap: true,
                        sx: { fontSize: "0.75rem" },
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </SidebarNav>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          {reviewData.review.final.map((fileData, index) => {
            // Find corresponding syntax and standards issues for this file
            const syntaxData = reviewData.review.syntax.find(
              (f) => f.file === fileData.file
            );
            const standardsData = reviewData.review.standards.find(
              (f) => f.file === fileData.file
            );

            return (
              <Box
                key={index}
                mb={6}
                ref={(el) => (sectionRefs.current[fileData.file] = el)}
                id={`file-${fileData.file.replace(/[^a-zA-Z0-9]/g, "-")}`}
              >
                <FileHeader>
                  <Typography variant="h6">
                    <FileIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                    {fileData.file}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {fileData.summary}
                  </Typography>
                </FileHeader>

                {/* Ratings Section */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader title="Code Quality Metrics" />
                  <CardContent>
                    <Grid container spacing={2}>
                      {fileData.ratings &&
                        Object.entries(fileData.ratings).map(
                          ([key, value], idx) => (
                            <Grid item xs={12} md={6} key={idx}>
                              <ScoreRating
                                label={key.replace(/_/g, " ")}
                                score={value}
                                color={
                                  value < 5
                                    ? "error"
                                    : value < 7
                                    ? "warning"
                                    : "success"
                                }
                              />
                            </Grid>
                          )
                        )}
                    </Grid>
                  </CardContent>
                </Card>

                {/* Critical Issues */}
                {fileData.critical_issues.length > 0 && (
                  <Accordion defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <ErrorIcon color="error" sx={{ mr: 1 }} />
                        Critical Issues ({fileData.critical_issues.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {fileData.critical_issues.map((issue, idx) => (
                        <IssueCard
                          key={idx}
                          severity="critical"
                          variant="outlined"
                        >
                          <CardContent>
                            <Typography variant="body1">{issue}</Typography>
                          </CardContent>
                        </IssueCard>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Syntax Issues */}
                {syntaxData &&
                  syntaxData.issues &&
                  syntaxData.issues.length > 0 && (
                    <Accordion defaultExpanded sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <WarningIcon color="warning" sx={{ mr: 1 }} />
                          Syntax Issues ({syntaxData.issues.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {syntaxData.issues.map((issue, idx) => (
                          <IssueCard
                            key={idx}
                            severity="warning"
                            variant="outlined"
                          >
                            <CardContent>
                              <Typography variant="subtitle2" gutterBottom>
                                Line {issue.location}
                              </Typography>
                              <Typography variant="body1">
                                {issue.description}
                              </Typography>
                            </CardContent>
                          </IssueCard>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  )}

                {/* Standards Issues */}
                {standardsData &&
                  standardsData.issues &&
                  standardsData.issues.length > 0 && (
                    <Accordion defaultExpanded sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <RuleIcon color="info" sx={{ mr: 1 }} />
                          Standards Issues ({standardsData.issues.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {standardsData.issues.map((issue, idx) => (
                          <IssueCard
                            key={idx}
                            severity="info"
                            variant="outlined"
                          >
                            <CardContent>
                              <Typography variant="subtitle2" gutterBottom>
                                Line {issue.location}
                              </Typography>
                              <Typography variant="body1">
                                {issue.standard}
                              </Typography>
                            </CardContent>
                          </IssueCard>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  )}

                {/* Suggested Fixes for this file */}
                {reviewData.artifacts &&
                  reviewData.artifacts.fixes &&
                  reviewData.artifacts.fixes[fileData.file] && (
                    <Accordion defaultExpanded sx={{ mb: 3 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <CodeIcon color="success" sx={{ mr: 1 }} />
                          Suggested Fixes
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Card variant="outlined">
                          <CardContent>
                            <Box
                              sx={{
                                backgroundColor: "#f5f5f5",
                                p: 2,
                                borderRadius: 1,
                                fontFamily: "monospace",
                                overflowX: "auto",
                              }}
                            >
                              <ReactMarkdown>
                                {reviewData.artifacts.fixes[fileData.file]}
                              </ReactMarkdown>
                            </Box>
                          </CardContent>
                        </Card>
                      </AccordionDetails>
                    </Accordion>
                  )}
              </Box>
            );
          })}

          {/* General Summary and Recommendations */}
          {reviewData.artifacts && reviewData.artifacts.summary && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                General Recommendations
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <ReactMarkdown>{reviewData.artifacts.summary}</ReactMarkdown>
                </CardContent>
              </Card>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReviewReport;
