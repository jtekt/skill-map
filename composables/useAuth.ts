export default function () {
  const useAuthUser = () => useState<any | undefined>("auth_user");
  const useAccessToken = () => useState("jwt");
  const user = computed(() => useAuthUser().value).value;

  const setUser = (newUser: any | undefined) => {
    const authUser = useAuthUser();
    authUser.value = newUser;
  };

  const setAccessToken = (jwt: string | undefined) => {
    const accessToken = useAccessToken();
    accessToken.value = jwt;
  };

  return {
    useAuthUser,
    setAccessToken,
    setUser,
    useAccessToken,
    user
  };
}
