"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AuthService } from "@/services/auth.service";

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  User,
} from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  fetchCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

const applyAuth = (
  set: (state: Partial<AuthState>) => void,
  response: AuthResponse,
) => {
  set({
    user: response.data.user,
    accessToken: response.data.accessToken,
    isAuthenticated: true,
    initialized: true,
  });
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loading: false,
      initialized: false,

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          loading: false,
          initialized: true,
        }),

      register: async (payload) => {
        set({ loading: true });

        try {
          return await AuthService.register({
            ...payload,
            email: payload.email.trim().toLowerCase(),
          });
        } finally {
          set({ loading: false });
        }
      },

      login: async (payload) => {
        set({ loading: true });

        try {
          const response = await AuthService.login({
            email: payload.email.trim().toLowerCase(),
            password: payload.password,
          });

          applyAuth(set, response);
        } finally {
          set({ loading: false });
        }
      },

      verifyEmail: async (token) => {
        set({ loading: true });

        try {
          const response = await AuthService.verifyEmail(token);
          applyAuth(set, response);
        } finally {
          set({ loading: false });
        }
      },

      resendVerificationEmail: async (email) => {
        await AuthService.resendVerificationEmail(email.trim().toLowerCase());
      },

      refreshAccessToken: async () => {
        try {
          const response = await AuthService.refreshToken();
          const accessToken = response.data.accessToken;

          set({
            accessToken,
            isAuthenticated: true,
          });

          return accessToken;
        } catch {
          get().clearAuth();
          return null;
        }
      },

      fetchCurrentUser: async () => {
        let token = get().accessToken;

        if (!token) {
          token = await get().refreshAccessToken();
        }

        if (!token) {
          set({ initialized: true });
          return;
        }

        try {
          const response = await AuthService.getCurrentUser(token);

          set({
            user: response.data,
            isAuthenticated: true,
            initialized: true,
          });
        } catch {
          const refreshedToken = await get().refreshAccessToken();

          if (!refreshedToken) return;

          try {
            const response = await AuthService.getCurrentUser(refreshedToken);

            set({
              user: response.data,
              isAuthenticated: true,
              initialized: true,
            });
          } catch {
            get().clearAuth();
          }
        }
      },

      logout: async () => {
        const token = get().accessToken;

        set({ loading: true });

        try {
          await AuthService.logout(token);
        } catch {
          // Even if the server token is expired, the browser must still log out locally. // Elijah !
        } finally {
          get().clearAuth();
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    },
  ),
);
