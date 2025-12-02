import { useUser } from "~/composables/useUser";

export default defineNuxtRouteMiddleware(async () => {
    if (import.meta.server) return
    const { loadUser } = useUser();
    await loadUser();
});