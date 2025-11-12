// composables/useTheme.ts
import { ref, watch } from "vue";

export type Theme =
  | "financial-blue"
  | "warm-neutral"
  | "minimalist"
  | "dark-professional";
export type Mode = "light" | "dark";

export interface ThemeConfig {
  theme: Theme;
  mode: Mode;
}

const STORAGE_KEYS = {
  THEME: "pnl-theme",
  MODE: "pnl-mode",
} as const;

export const useTheme = () => {
  const currentTheme = ref<Theme>("financial-blue");
  const currentMode = ref<Mode>("light");

  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    if (!process.client) return;

    // Check if theme was already applied by the plugin/script
    const html = document.documentElement;
    const hasThemeClass =
      html.classList.contains("financial-blue") ||
      html.classList.contains("warm-neutral") ||
      html.classList.contains("minimalist") ||
      html.classList.contains("dark-professional");

    const hasModeClass =
      html.classList.contains("light") || html.classList.contains("dark");

    // Load saved theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) as Mode | null;

    if (savedTheme) {
      currentTheme.value = savedTheme;
    }

    if (savedMode) {
      currentMode.value = savedMode;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      currentMode.value = prefersDark ? "dark" : "light";
    }

    // Only apply theme if not already applied (prevents flash)
    if (!hasThemeClass || !hasModeClass) {
      applyTheme();
    }
  };

  // Apply theme to document
  const applyTheme = () => {
    if (!process.client) return;

    const html = document.documentElement;

    // Remove all theme and mode classes
    html.classList.remove(
      "financial-blue",
      "warm-neutral",
      "minimalist",
      "dark-professional",
      "light",
      "dark"
    );

    // Apply current theme and mode
    html.classList.add(currentTheme.value, currentMode.value);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.THEME, currentTheme.value);
    localStorage.setItem(STORAGE_KEYS.MODE, currentMode.value);
  };

  // Set theme
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme;
    applyTheme();
  };

  // Set mode
  const setMode = (mode: Mode) => {
    currentMode.value = mode;
    applyTheme();
  };

  // Toggle between light and dark mode
  const toggleMode = () => {
    currentMode.value = currentMode.value === "light" ? "dark" : "light";
    applyTheme();
  };

  // Set both theme and mode at once
  const setThemeConfig = (config: ThemeConfig) => {
    currentTheme.value = config.theme;
    currentMode.value = config.mode;
    applyTheme();
  };

  // Get current theme config
  const getThemeConfig = (): ThemeConfig => {
    return {
      theme: currentTheme.value,
      mode: currentMode.value,
    };
  };

  // Listen for system theme changes
  const watchSystemTheme = () => {
    if (!process.client) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const hasManualPreference = localStorage.getItem(STORAGE_KEYS.MODE);
      if (!hasManualPreference) {
        currentMode.value = e.matches ? "dark" : "light";
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    // Return cleanup function
    return () => mediaQuery.removeEventListener("change", handleChange);
  };

  // Watch for changes and apply theme
  watch([currentTheme, currentMode], () => {
    applyTheme();
  });

  return {
    currentTheme,
    currentMode,
    initTheme,
    setTheme,
    setMode,
    toggleMode,
    setThemeConfig,
    getThemeConfig,
    watchSystemTheme,
  };
};
