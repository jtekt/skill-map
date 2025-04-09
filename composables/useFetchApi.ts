export default (url: string, options: any = {}) => {
  const { tokenSet } = useAuth();
  return $fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${tokenSet.value.access_token}`,
    },
  });
};
