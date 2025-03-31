export default (url: string, options: any = {}) => {
  const { useAccessToken } = useAuth();
  return $fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${useAccessToken().value}`,
    },
  });
};
