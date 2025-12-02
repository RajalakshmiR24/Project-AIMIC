import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { authApi } from "../api/auth.api";
import type { LoginCredentials, RegisterData, User, Role } from "../api/types";
import { decodeRoleFromToken } from "../utils/jwt";

type AuthContextType = {
  user: User | null;
  role: Role | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<Role>;
  register: (data: RegisterData & { confirmPassword?: string }) => Promise<Role>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

const STORAGE_TOKEN = "token";
const STORAGE_ROLE = "role";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ----------------------------------------------------
     RESTORE SESSION ON PAGE RELOAD
  ---------------------------------------------------- */
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_TOKEN);
    const savedRole = localStorage.getItem(STORAGE_ROLE) as Role | null;

    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);

    const restoreUser = async () => {
      if (savedToken) {
        try {
          const res = await authApi.me();
          setUser(res.user);
        } catch {
          logout();
        }
      }

      setIsLoading(false);
    };

    restoreUser();
  }, []);

  /* ----------------------------------------------------
     TOKEN + ROLE EXTRACTORS
  ---------------------------------------------------- */
  const extractToken = (raw: any): string => {
    return (
      raw?.token ||
      raw?.accessToken ||
      raw?.jwt ||
      raw?.id_token ||
      raw?.data?.token ||
      raw?.data?.accessToken
    );
  };

  const extractRole = (
    raw: any,
    token: string | null,
    fallback: Role
  ): Role => {
    const decoded = decodeRoleFromToken(token) as Role | null;
    const apiRole = raw?.user?.role as Role | undefined;

    if (apiRole === "employee" || apiRole === "hospital" || apiRole === "insurance")
      return apiRole;

    if (decoded === "employee" || decoded === "hospital" || decoded === "insurance")
      return decoded;

    return fallback;
  };

  /* ----------------------------------------------------
     LOGIN
  ---------------------------------------------------- */
  const login = async (credentials: LoginCredentials): Promise<Role> => {
    const raw = await authApi.login(credentials);
    const token = extractToken(raw);
    if (!token) throw new Error("No token in login response");

    const role = extractRole(raw, token, "employee");

    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_ROLE, role);

    setToken(token);
    setRole(role);
    setUser(raw?.user || ({ role } as User));

    try {
      const res = await authApi.me();
      if (res.user) setUser(res.user);
    } catch {}

    return role;
  };

  /* ----------------------------------------------------
     REGISTER
  ---------------------------------------------------- */
  const register = async (
    data: RegisterData & { confirmPassword?: string }
  ): Promise<Role> => {
    const { confirmPassword, ...payload } = data;

    const raw = await authApi.register(payload);
    const token = extractToken(raw);

    if (!token) throw new Error("No token in register response");

    const role = extractRole(raw, token, payload.role);

    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_ROLE, role);

    setToken(token);
    setRole(role);
    setUser(raw?.user || ({ role } as User));

    try {
      const res = await authApi.me();
      if (res.user) setUser(res.user);
    } catch {}

    return role;
  };

  /* ----------------------------------------------------
     LOGOUT
  ---------------------------------------------------- */
  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_ROLE);
    setToken(null);
    setRole(null);
    setUser(null);
  };

  /* ----------------------------------------------------
     CONTEXT VALUE
  ---------------------------------------------------- */
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
