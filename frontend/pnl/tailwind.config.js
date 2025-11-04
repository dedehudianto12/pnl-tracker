/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use 'class' to enable dark mode based on the presence of the .dark class on an element
  darkMode: "class",

  // Configure files to scan for Tailwind utility usage
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],

  theme: {
    // Standard container setup often used with shadcn-vue
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Map all custom CSS variables to Tailwind utility names.
      // We use the raw 'var(...)' string because your colors are in the OKLCH format.
      colors: {
        // Base/Core Colors
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Semantic Colors
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        // Component-specific Colors
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        // Custom Sidebar Colors
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Chart Colors
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
      },

      // Map custom radius variables to Tailwind's border-radius utilities
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`, // Defined in your original custom theme block
        sm: `calc(var(--radius) - 4px)`, // Defined in your original custom theme block
      },
    },
  },

  plugins: [],
};
