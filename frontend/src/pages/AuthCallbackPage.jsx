import React, { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AuthCallbackPage() {
  const { handleLoginSuccess } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const error = queryParams.get("error"); // Or 'message' based on backend error redirect

    if (token) {
      handleLoginSuccess(token)
        .then(() => {
          navigate("/"); // Redirect to dashboard or desired page
        })
        .catch((err) => {
          console.error("Failed to process token:", err);
          navigate("/login", {
            state: { error: "Authentication failed. Please try again." },
          });
        });
    } else if (error) {
      console.error("GitHub OAuth Error:", error);
      navigate("/login", {
        state: { error: `Authentication failed: ${error}` },
      });
    } else {
      // Should not happen in normal flow
      console.error("No token or error found in callback.");
      navigate("/login", {
        state: { error: "An unexpected error occurred during authentication." },
      });
    }
  }, [location, navigate, handleLoginSuccess]);

  return (
    <div>
      <p>Processing authentication...</p>
      {/* You can add a loading spinner here */}
    </div>
  );
}

export default AuthCallbackPage;
