export default (url: string, options: any = {}) => {
  const { session } = useUserSession();

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (session.value?.tokens?.access_token) {
    headers.Authorization = `Bearer ${session.value?.tokens?.access_token || ""}`;
  }

  return $fetch(url, {
    ...options,
    headers,
  });
};
