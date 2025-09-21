import { axiosInstance } from "./axiosInstance";

export type Role = "employee" | "doctor" | "insurance";

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const STORAGE_TOKEN = "token";

/** Keep axios Authorization header synced with localStorage */
function setAuthHeader(token?: string | null) {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
}

// On reload, attach token if present
setAuthHeader(localStorage.getItem(STORAGE_TOKEN));

export const api = {
  async login(credentials: LoginCredentials): Promise<any> {
    const res = await axiosInstance.post("/api/auth/login", credentials);
    // Try to set header immediately if token exists in any common key
    const token =
      res.data?.token ||
      res.data?.accessToken ||
      res.data?.jwt ||
      res.data?.id_token ||
      res.data?.data?.token ||
      res.data?.data?.accessToken;

    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token);
      setAuthHeader(token);
    }
    return res.data; // AuthContext will normalize
  },

  async register(data: RegisterData): Promise<any> {
    const res = await axiosInstance.post("/api/auth/register", data);

    const token =
      res.data?.token ||
      res.data?.accessToken ||
      res.data?.jwt ||
      res.data?.id_token ||
      res.data?.data?.token ||
      res.data?.data?.accessToken;

    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token);
      setAuthHeader(token);
    }
    return res.data; // AuthContext will normalize
  },

  async me(): Promise<{ user: User }> {
    const res = await axiosInstance.get("/api/auth/me");
    return res.data;
  },
};
