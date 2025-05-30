import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/apiService"; // Import authService

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("githubToken"));
  const [loading, setLoading] = useState(true); // To manage initial auth check

  const login = () => {
    // Redirect to backend GitHub OAuth login URL
    window.location.href = "http://localhost:8000/api/v1/auth/github/login";
  };

  const handleLoginSuccess = async (receivedToken) => {
    localStorage.setItem("githubToken", receivedToken);
    setToken(receivedToken);
    try {
      const { data: currentUser } = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to fetch user after login:", error);
      // Clear token if user fetch fails
      localStorage.removeItem("githubToken");
      setToken(null);
      setUser(null);
      throw error; // Re-throw to be caught by AuthCallbackPage
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("githubToken");
    // Optionally redirect to login page or homepage
    // window.location.href = '/login';
  };

  const checkAuth = async () => {
    setLoading(true);
    const storedToken = localStorage.getItem("githubToken");
    if (storedToken) {
      setToken(storedToken); // Set token for apiService interceptor
      try {
        const { data: currentUser } = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Session validation failed:", error);
        localStorage.removeItem("githubToken");
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        checkAuth,
        handleLoginSuccess, // Expose new function
        isAuthenticated: !!token && !!user, // Ensure user is also loaded
        isLoading: loading, // Expose loading state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
