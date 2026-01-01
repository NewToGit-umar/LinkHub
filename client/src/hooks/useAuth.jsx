import { useState, useEffect, createContext, useContext } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("linkhub_token");
      const savedUser = localStorage.getItem("linkhub_user");

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      console.log("[auth] login response:", response?.data);
      const { token, user: userData } = response.data;

      localStorage.setItem("linkhub_token", token);
      localStorage.setItem("linkhub_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      console.log("[auth] register response:", response?.data);
      const { token, user: newUser } = response.data;

      localStorage.setItem("linkhub_token", token);
      localStorage.setItem("linkhub_user", JSON.stringify(newUser));
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error("[auth] register error:", error?.response || error);
      const errMsg =
        error?.response?.data?.message ||
        error.message ||
        "Registration failed";
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("linkhub_token");
    localStorage.removeItem("linkhub_user");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
