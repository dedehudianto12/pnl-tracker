import { defineStore } from "pinia";
import type { User } from "~/types/models.ts";

import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "~/types/api.ts";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async register(data: RegisterRequest) {
      this.loading = true;
      this.error = null;

      try {
        const { apiFetch } = useApi();
        const response = await apiFetch<AuthResponse>("/auth/register", {
          method: "POST",
          body: data,
        });

        this.setAuth(response);
        return response;
      } catch (err: any) {
        this.error = err.data?.error || "Registration failed";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async login(data: LoginRequest) {
      this.loading = true;
      this.error = null;

      try {
        const { apiFetch } = useApi();
        const response = await apiFetch<AuthResponse>("/auth/login", {
          method: "POST",
          body: data,
        });

        this.setAuth(response);
        return response;
      } catch (err: any) {
        this.error = err.data?.error || "Login failed";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      try {
        const { apiFetch } = useApi();
        const user = await apiFetch<User>("/auth/profile");
        this.user = user;
        return user;
      } catch (err) {
        this.logout();
        throw err;
      }
    },

    async initializeAuth() {
      const tokenCookie = useCookie("token");
      if (tokenCookie.value) {
        this.token = tokenCookie.value;
        try {
          await this.fetchProfile();
        } catch (err) {
          this.logout();
        }
      }
    },

    setAuth(response: AuthResponse) {
      this.user = response.user;
      this.token = response.token;

      // Store token in cookie
      const tokenCookie = useCookie("token", {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });
      tokenCookie.value = response.token;
    },

    logout() {
      this.user = null;
      this.token = null;

      // Clear cookie
      const tokenCookie = useCookie("token");
      tokenCookie.value = null;

      // Redirect to login
      navigateTo("/login");
    },
  },
});
