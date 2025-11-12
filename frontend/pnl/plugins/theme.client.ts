// plugins/theme.client.ts
export default defineNuxtPlugin(() => {
  // This runs on client-side only, before Vue hydration
  if (process.client) {
    try {
      const theme = localStorage.getItem("pnl-theme") || "financial-blue";
      const mode =
        localStorage.getItem("pnl-mode") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");

      // Apply theme immediately to prevent flash
      document.documentElement.classList.add(theme, mode);
    } catch (error) {
      console.error("Failed to initialize theme:", error);
    }
  }
});
