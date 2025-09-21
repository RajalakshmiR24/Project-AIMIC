import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/api";
import type { LoginCredentials, RegisterData } from "../api/api";
import { decodeRoleFromToken } from "../utils/jwt";

export interface AuthContextType {
  role: string | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<string>; // returns role
  register: (data: RegisterData & { confirmPassword?: string }) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

const STORAGE_TOKEN = "token";
const STORAGE_ROLE = "role";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_TOKEN);
    const savedRole = localStorage.getItem(STORAGE_ROLE);

    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<string> => {
    const raw = await api.login(credentials);

    const token =
      raw?.token || raw?.accessToken || raw?.jwt || raw?.id_token || raw?.data?.token;
    if (!token) throw new Error("No token in login response");

    const decodedRole = raw?.user?.role || decodeRoleFromToken(token) || "employee";

    // persist only token + role
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_ROLE, decodedRole);

    setToken(token);
    setRole(decodedRole);

    return decodedRole;
  };

  const register = async (data: RegisterData & { confirmPassword?: string }): Promise<string> => {
    const { confirmPassword, ...payload } = data;
    const raw = await api.register(payload);

    const token =
      raw?.token || raw?.accessToken || raw?.jwt || raw?.id_token || raw?.data?.token;
    if (!token) throw new Error("No token in register response");

    const decodedRole = raw?.user?.role || decodeRoleFromToken(token) || payload.role;

    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_ROLE, decodedRole);

    setToken(token);
    setRole(decodedRole);

    return decodedRole;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_ROLE);
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!role && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
