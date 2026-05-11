export const useAuthIdentifier = () => {
  const { user } = useUserSession();
  const config = useRuntimeConfig();

  const identifierKey = computed(() => {
    return config.public.authOidcIdentifierField || "preferred_username";
  });

  // For persistent anonymous IDs
  const ANON_KEY = "anon_user";

  const user_id = computed<string | number | undefined>(() => {
    // If auth is enabled, return the actual user identifier
    if (!isAuthDisabled()) {
      const u = user.value;
      if (!u) return undefined;

      const key = identifierKey.value;
      const value = u[key as keyof typeof u];
      return typeof value === "string" || typeof value === "number"
        ? value
        : undefined;
    }

    // If auth is disabled, use anonymous ID
    return ANON_KEY;
  });

  const isAnonymousId = (id: string | number | undefined) => {
    return typeof id === "string" && id.startsWith("anon_");
  };

  return {
    user_id,
    identifierKey,
    isAnonymousId,
  };
};
