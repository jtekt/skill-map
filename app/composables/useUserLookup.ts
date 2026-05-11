export function useUserLookup() {
  const config = useRuntimeConfig();
  const { session } = useUserSession();
  const { isAnonymousId } = useAuthIdentifier();

  const lookupUrl = config.public.userLookup.url as string | undefined;
  const identifierField = config.public.userLookup.identifierField as
    | string
    | undefined;
  const displayNameField = config.public.userLookup.displayNameField as
    | string
    | undefined;

  const isServer = import.meta.server;

  const shouldLookup = computed(() =>
    Boolean(lookupUrl && identifierField && displayNameField),
  );

  const isObject = (val: any) =>
    val !== null && typeof val === "object" && !Array.isArray(val);

  const extractUsers = (data: any, identifier: string): any[] => {
    const results: any[] = [];

    const search = (value: any) => {
      if (!value) return;

      if (Array.isArray(value)) {
        value.forEach((v) => search(v));
        return;
      }

      if (isObject(value)) {
        if (Object.prototype.hasOwnProperty.call(value, identifier)) {
          results.push(value);
        }
        Object.values(value).forEach((v) => search(v));
      }
    };

    search(data);
    return results;
  };

  const fetchUsers = async (
    ids: string[],
  ): Promise<{ user_id: string; display_name: string }[]> => {
    if (!ids || ids.length === 0) return [];

    if (!shouldLookup.value)
      return ids.map((id) => ({ user_id: id, display_name: id }));

    // 2. During SSR: DO NOT HIT EXTERNAL APIs
    if (isServer) {
      return ids.map((id) => ({
        user_id: id,
        display_name: id,
      }));
    }

    try {
      const response: any = await $fetch(lookupUrl!, {
        method: "GET",
        query: {
          [identifierField as string]: ids,
        },
        headers: {
          Authorization: `Bearer ${session.value?.tokens?.access_token || ""}`,
        },
      });

      const rawUsers = extractUsers(response, identifierField!);

      return ids.map((id) => {
        // Skip lookup: anonymous IDs get fallback display
        if (isAnonymousId(id)) {
          return {
            user_id: id,
            display_name: id, // show anon_xxx as display name
          };
        }
        const match = rawUsers.find((u) => String(u[identifierField!]) === id);
        const display =
          match?.[displayNameField as string] ??
          match?.[identifierField as string] ??
          id;

        return {
          user_id: id,
          display_name: String(display),
        };
      });
    } catch (err) {
      console.error("User lookup failed:", err);

      return ids.map((id) => ({
        user_id: id,
        display_name: id,
      }));
    }
  };

  return {
    fetchUsers,
  };
}
