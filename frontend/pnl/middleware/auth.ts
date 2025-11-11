export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuthStore();

  await auth.initializeAuth();
  const publicPages = ["/login", "/register"];
  const isPublicPage = publicPages.includes(to.path);

  if (!auth.isAuthenticated && !isPublicPage) {
    return navigateTo("/login");
  }
});
