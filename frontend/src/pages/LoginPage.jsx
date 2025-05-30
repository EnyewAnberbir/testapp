import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  Fade,
} from "@mui/material";
import { GitHub as GitHubIcon } from "@mui/icons-material";

function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const errorMessage = location.state?.error;

  const handleLogin = () => {
    login();
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Fade in timeout={1000}>
        <Card
          elevation={8}
          sx={{
            width: "100%",
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
              px: 3,
              gap: 3,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                textFillColor: "transparent",
                mb: 2,
              }}
            >
              Welcome to Code Review AI
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {errorMessage}
              </Alert>
            )}

            <Typography variant="body1" color="text.secondary" align="center">
              Sign in with your GitHub account to start reviewing your code with AI
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              startIcon={<GitHubIcon />}
              sx={{
                mt: 2,
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1.1rem",
                background: "linear-gradient(45deg, #24292e 30%, #40464e 90%)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1b1f23 30%, #2f3439 90%)",
                },
              }}
            >
              Continue with GitHub
            </Button>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
}

export default LoginPage;
