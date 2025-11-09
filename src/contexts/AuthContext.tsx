import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "../api/api";
import type { LoginCredentials, RegisterData, User } from "../api/api";
import { decodeRoleFromToken } from "../utils/jwt";

/** Context Type */
export interface AuthContextType {
  user: User | null;
  role: string | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<string>; // returns role
  register: (data: RegisterData & { confirmPassword?: string }) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/** Context Creation */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Hook */
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

/** Storage Keys */
const STORAGE_TOKEN = "token";
const STORAGE_ROLE = "role";

/** Provider */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_TOKEN);
    const savedRole = localStorage.getItem(STORAGE_ROLE);

    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);

    const restoreUser = async () => {
      if (savedToken) {
        try {
          const res = await api.me();
          setUser(res.user);
        } catch (err) {
          console.warn("Failed to restore session:", err);
          logout();
        }
      }
      setIsLoading(false);
    };

    restoreUser();
  }, []);

  /** Login */
  const login = async (credentials: LoginCredentials): Promise<string> => {
    const raw = await api.login(credentials);

    // Extract token and role safely
    const token =
      raw?.token ||
      raw?.accessToken ||
      raw?.jwt ||
      raw?.id_token ||
      raw?.data?.token ||
      raw?.data?.accessToken;
    if (!token) throw new Error("No token in login response");

    const decodedRole =
      raw?.user?.role || decodeRoleFromToken(token) || "employee";

    // Persist token and role
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_ROLE, decodedRole);

    // Update state
    setToken(token);
    setRole(decodedRole);
    setUser(raw?.user || { role: decodedRole } as User);

    // If backend supports /me, fetch full user details
    try {
      const res = await api.me();
      if (res?.user) setUser(res.user);
    } catch (e) {
      console.warn("Unable to fetch user details:", e);
    }

    return decodedRole;
  };

  /** Register */
  const register = async (
    data: RegisterData & { confirmPassword?: string }
  ): Promise<string> => {
    const { confirmPassword, ...payload } = data;
    const raw = await api.register(payload);

    const token =
      raw?.token ||
      raw?.accessToken ||
      raw?.jwt ||
      raw?.id_token ||
      raw?.data?.token ||
      raw?.data?.accessToken;
    if (!token) throw new Error("No token in register response");

    const decodedRole =
      raw?.user?.role || decodeRoleFromToken(token) || payload.role;

    // Persist
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_ROLE, decodedRole);

    setToken(token);
    setRole(decodedRole);
    setUser(raw?.user || { role: decodedRole } as User);

    // Optional fetch user details
    try {
      const res = await api.me();
      if (res?.user) setUser(res.user);
    } catch (e) {
      console.warn("Unable to fetch user details after registration:", e);
    }

    return decodedRole;
  };

  /** Logout */
  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_ROLE);
    setToken(null);
    setRole(null);
    setUser(null);
  };

  /** Context Value */
  const value: AuthContextType = {
    user,
    role,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!role,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
