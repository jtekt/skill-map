export const useAuthIdentifier = () => {
  const { user } = useUserSession();
  const config = useRuntimeConfig();

  const identifierKey = computed(() => {
    return config.public.authOidcIdentifierField || "preferred_username";
  });

  const user_id = computed<string | number | undefined>(() => {
    const u = user.value;
    if (!u) return undefined;

    const key = identifierKey.value;

    // dynamic field access
    const value = u[key as keyof typeof u];
    return typeof value === "string" || typeof value === "number"
      ? value
      : undefined;
  });

  return {
    user_id,
    identifierKey,
  };
};
