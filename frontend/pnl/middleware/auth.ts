// export default defineNuxtRouteMiddleware((to, from) => {
//   const auth = useAuthStore();
//   console.log("Auth middleware check:", {
//     isAuthenticated: auth.isAuthenticated,
//     targetRoute: to.fullPath,
//   });
//   let isAuthenticated = auth.isAuthenticated;
//   console.log("Current auth state:", auth.currentUser);
//   if (!isAuthenticated && to.path !== "/login") {
//     // Redirect to the login page if not authenticated and not already on the login page
//     return navigateTo("/login");
//   } else if (isAuthenticated && to.path === "/login") {
//     // Redirect to a dashboard or home page if already authenticated and trying to access login
//     return navigateTo("/"); // Or another appropriate authenticated route
//   }
// });

// export default defineNuxtPlugin(async (nuxtApp) => {
//   const auth = useAuthStore();

//   // The logic is moved directly into the top-level async function of the plugin.
//   // When a Nuxt plugin is async, Nuxt automatically awaits its completion on the server
//   // before proceeding to middleware and rendering, fixing the timing issue.

//   // Check if the store is already initialized.
//   if (!auth.user) {
//     if (process.server) {
//       console.log("[Auth Plugin] SERVER: Restoring session from cookie...");
//     } else {
//       console.log("[Auth Plugin] CLIENT: Restoring session from cookie...");
//     }

//     // We await auth.initializeAuth() here. This PAUSES the server's rendering
//     // process until the token is checked and the user state is loaded,
//     // guaranteeing the middleware sees the correct state.
//     await auth.initializeAuth();
//   }

//   // No need for a return statement unless you are providing utilities.
// });

export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuthStore();

  await auth.initializeAuth();
  const publicPages = ["/login", "/register"];
  const isPublicPage = publicPages.includes(to.path);

  if (!auth.isAuthenticated && !isPublicPage) {
    return navigateTo("/login");
  }
});
