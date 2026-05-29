import axios from "axios";
import { useAuthStore } from "../store/auth.store";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000", withCredentials: true });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as { _retry?: boolean; headers: Record<string, string>; url?: string };
    if (error.response?.status === 401 && !original?._retry && !original.url?.includes("/auth/")) {
      original._retry = true;
      try {
        const refreshRes = await api.post("/api/v1/auth/refresh", {});
        useAuthStore.getState().setToken(refreshRes.data.data.accessToken);
        original.headers.Authorization = `Bearer ${refreshRes.data.data.accessToken}`;
        return api(original);
      } catch {
        await useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
