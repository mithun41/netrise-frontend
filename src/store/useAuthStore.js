import { create } from "zustand";

// Helpers for syncing auth token with cookies for Next.js middleware & server-side checks
function setCookie(name, value, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export const useAuthStore = create((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  // Initialize auth from localStorage and sync cookies
  initializeAuth: () => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("netrise_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.tokens?.access && parsed?.user) {
          const userObj = {
            ...parsed.user,
            is_staff: Boolean(parsed.user.is_staff || parsed.user.user_type === "ADMIN"),
          };
          setCookie("netrise_token", parsed.tokens.access, 7);
          set({
            user: userObj,
            tokens: parsed.tokens,
            isAuthenticated: true,
            isInitialized: true,
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to parse stored auth", e);
    }

    deleteCookie("netrise_token");
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  // Login action
  login: (userData, tokens) => {
    const userObj = {
      ...userData,
      is_staff: Boolean(userData?.is_staff || userData?.user_type === "ADMIN"),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("netrise_auth", JSON.stringify({ user: userObj, tokens }));
      if (tokens?.access) {
        setCookie("netrise_token", tokens.access, 7);
      }
    }
    set({
      user: userObj,
      tokens: tokens,
      isAuthenticated: true,
      isInitialized: true,
      isLoading: false,
    });
  },

  // Logout action
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("netrise_auth");
      deleteCookie("netrise_token");
    }
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
    });
  },

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Update user profile
  updateUser: (updates) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null;
      if (typeof window !== "undefined" && updatedUser) {
        localStorage.setItem(
          "netrise_auth",
          JSON.stringify({ user: updatedUser, tokens: state.tokens })
        );
      }
      return { user: updatedUser };
    });
  },
}));
