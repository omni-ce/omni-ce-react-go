import { create } from "zustand";
import { authService } from "@/services/auth.service";
import type { AxiosError } from "axios";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message: string | null }>;
  logout: () => Promise<{ success: boolean; message: string | null }>;
  validateToken: (on?: string) => Promise<boolean>;
  setAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isLoading: true,
  isAuthenticated: false,
  login: async (username, password) => {
    try {
      const response = await authService.login(username, password);
      if (response.data?.token) {
        const token = response.data.token;
        const user = response.data.user;
        localStorage.setItem("token", token);
        set({ token, user, isAuthenticated: true });
        return { success: true, message: null };
      } else {
        return { success: false, message: response.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Login failed" };
    }
  },
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      set({ token: null, isAuthenticated: false });
    }
    return { success: true, message: null };
  },
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  validateToken: async (on?: string) => {
    const { token, isAuthenticated } = get();
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return false;
    }
    if (isAuthenticated) return true;
    try {
      const resp = await authService.validate(on);
      const user = resp.data.user;
      set({ isAuthenticated: true, isLoading: false, user });
      return true;
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        // localStorage.removeItem("token");
        set({ isAuthenticated: false, token: null, isLoading: false });
      }
      return false;
    }
  },
}));
