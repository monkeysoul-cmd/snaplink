import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types.js";
import { api } from "../services/api.js";

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("linkcut_token"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check user authentication on boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("linkcut_token");
      if (storedToken) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
          setIsAuthenticated(true);
          setToken(storedToken);
        } catch (error) {
          console.warn("Auto-login failed:", error);
          // Token is likely invalid, clean up
          localStorage.removeItem("linkcut_token");
          setUser(null);
          setIsAuthenticated(false);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(email, password);
      localStorage.setItem("linkcut_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.register(name, email, password);
      localStorage.setItem("linkcut_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("linkcut_token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    window.location.hash = "#/login";
  };

  const refreshUser = async () => {
    try {
      const profile = await api.auth.me();
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh user profile", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
