export default defineNuxtRouteMiddleware((to) => {
  if (isAuthDisabled()) {
    return;
  }

  const { loggedIn } = useUserSession();

  // allow auth endpoints
  if (to.path.startsWith("/auth/")) {
    return;
  }

  if (!loggedIn.value && to.path !== "/auth") {
    return navigateTo("/auth");
  }

  if (to.path === "/auth" && loggedIn.value) {
    return navigateTo("/");
  }
});
