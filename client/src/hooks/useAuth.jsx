import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const AuthContext = createContext();

/**
 * AuthProvider Component - Manages authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("linkhub_token");

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await api.get("/auth/verify");
      setUser(response.data.user);
      setError(null);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("linkhub_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user: userData } = response.data.data;

      localStorage.setItem("linkhub_token", token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (
    firstName,
    lastName,
    email,
    password,
    passwordConfirm
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
      });
      const { token, user: userData } = response.data.data;

      localStorage.setItem("linkhub_token", token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("linkhub_token");
      setUser(null);
      setError(null);
    }
  };

  /**
   * Request password reset email
   */
  const forgotPassword = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset email";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (token, password, passwordConfirm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/auth/reset-password/${token}`, {
        password,
        passwordConfirm,
      });
      const { user: userData } = response.data.data;

      localStorage.setItem("linkhub_token", response.data.data.token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook - Access authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default useAuth;
