import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "../config/api";

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
  const [sessionToken, setSessionToken] = useState(null);

  // Axios interceptor for adding session token to requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (sessionToken) {
          config.headers.Authorization = `Bearer ${sessionToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [sessionToken]);

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("sessionToken");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setSessionToken(storedToken);

        // Verify session is still valid
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/status`);

          if (response.data.authenticated) {
            setUser(response.data.user);
          } else {
            // Session expired, clear storage
            await clearAuthData();
          }
        } catch (error) {
          // Session invalid, clear storage
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "sessionToken"]);
      setUser(null);
      setSessionToken(null);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const login = async (userData, token) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("sessionToken", token);

      setUser(userData);
      setSessionToken(token);
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {});
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      await clearAuthData();
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.rol === "admin" || user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
