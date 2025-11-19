import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@nuxt/icon", "@vee-validate/nuxt", "@pinia/nuxt", "shadcn-nuxt"],

  vite: {
    plugins: [tailwindcss()],
  },

  css: ["~/assets/css/main.css"],

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        "https://pnl-tracker.up.railway.app/api/v1",
    },
  },

  // App configuration
  app: {
    head: {
      title: "PNL Tracker - Project Management",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Project Profit & Loss Tracker" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false,
  },

  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },

  // Development server
  devServer: {
    port: 3000,
  },
});
