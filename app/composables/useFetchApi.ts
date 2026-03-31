export default (url: string, options: any = {}) => {
  const { user } = useOidcAuth();

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (user.value?.accessToken) {
    headers.Authorization = `Bearer ${user.value.accessToken}`;
  }

  return $fetch(url, {
    ...options,
    headers,
  });
};
