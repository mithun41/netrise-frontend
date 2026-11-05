import { create } from "zustand";

export const useAppStore = create((set) => ({
  // Theme state
  isDarkMode: false,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setTheme: (isDark) => set({ isDarkMode: isDark }),

  // Mobile sidebar/menu state
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // Global Notification / Toast state
  notification: null,
  showNotification: (message, type = "info") => {
    set({ notification: { message, type, id: Date.now() } });
    setTimeout(() => {
      set({ notification: null });
    }, 3000);
  },
  clearNotification: () => set({ notification: null }),
}));

