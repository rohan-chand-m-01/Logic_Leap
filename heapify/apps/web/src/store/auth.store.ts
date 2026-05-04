import { create } from "zustand";
import { api } from "../api/client";

interface User { id: string; email: string; role: "student" | "teacher" | "admin"; full_name: string }

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const res = await api.post("/api/v1/auth/login", { email, password });
    set({ accessToken: res.data.data.accessToken, user: res.data.data.user, isAuthenticated: true });
  },
  logout: async () => {
    try { await api.post("/api/v1/auth/logout", {}); } catch {}
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
  setToken: (token) => set({ accessToken: token, isAuthenticated: true }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));

