import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.get("/auth/verify");
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Token is invalid
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        setToken(token);
        setUser(user);

        toast.success("Welcome Admin! 🙏");
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Logged out successfully");
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
