export default (url: string, options: any = {}) => {
  const { tokenSet } = useAuth();

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };
  if (tokenSet.value?.access_token) {
    headers.Authorization = `Bearer ${tokenSet.value.access_token}`;
  }

  return $fetch(url, {
    ...options,
    headers,
  });
};
