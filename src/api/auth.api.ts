import { axiosInstance } from "./axiosInstance";

const STORAGE_TOKEN = "token";

function setAuthHeader(token?: string | null) {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
}

setAuthHeader(localStorage.getItem(STORAGE_TOKEN));

export const authApi = {
  async login(credentials: { email: string; password: string }) {
    const res = await axiosInstance.post("/api/auth/login", credentials);
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

    return res.data;
  },

  async register(data: { name: string; email: string; password: string; role: string }) {
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

    return res.data;
  },

  async me() {
    const res = await axiosInstance.get("/api/auth/me");
    return res.data;
  },

  logout() {
    localStorage.removeItem(STORAGE_TOKEN);
    setAuthHeader(null);
  }
};
