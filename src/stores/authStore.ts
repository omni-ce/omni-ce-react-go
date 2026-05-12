import { create } from "zustand";
import { authService } from "@/services/auth.service";
import type { AxiosError } from "axios";
import type { User } from "@/types/user";
import type { Rule } from "@/types/rule";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; rules?: Rule[] }>;
  logout: () => Promise<{ success: boolean; message: string | null }>;
  validateToken: (
    retrigger?: boolean,
  ) => Promise<{ isValid: boolean; rules?: Rule[] }>;
  setAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: localStorage.getItem("token") ?? null,
  isLoading: true,
  isAuthenticated: false,
  login: async (username, password) => {
    try {
      const response = await authService.login(username, password);
      if (response.data?.token) {
        const token = response.data.token;
        const user = response.data.user;
        const rules = response.data.rules;
        localStorage.setItem("token", token);
        set({ token, user, isAuthenticated: true });
        return { success: true, rules };
      } else {
        return {
          success: false,
        };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false };
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
  validateToken: async (retrigger = false) => {
    const { token, isAuthenticated } = get();
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return { isValid: false };
    }
    if (isAuthenticated && !retrigger) return { isValid: true };
    try {
      const resp = await authService.validate();
      const user = resp.data.user;
      const rules = resp.data.rules;
      set({ isAuthenticated: true, isLoading: false, user });
      return { isValid: true, rules };
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        // localStorage.removeItem("token");
        set({ isAuthenticated: false, token: null, isLoading: false });
      }
      return { isValid: false };
    }
  },
}));
