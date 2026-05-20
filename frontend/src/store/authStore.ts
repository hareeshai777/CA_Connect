"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  companyName?: string;
  status?: string;
  isAvailable?: boolean;
}

interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  role: "CLIENT" | "CA_PROFESSIONAL" | "SUPER_ADMIN";
  isEmailVerified: boolean;
  clientProfile?: UserProfile;
  caProfessional?: UserProfile;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.data, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
