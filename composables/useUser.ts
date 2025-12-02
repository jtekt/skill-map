export const useUser = () => {
  const loggedInUser = useState<any>('auth_user', () => undefined);
  const userLoading = useState<boolean>('auth_user_loading', () => false);
  const userLoaded = useState<boolean>('auth_user_loaded', () => false);

  const setUser = (newUser: any) => {
    loggedInUser.value = newUser;
    userLoaded.value = true;
  };

  const loadUser = async (): Promise<any> => {
    if (userLoaded.value || userLoading.value) {
      return loggedInUser.value;
    }

    const { tokenSet } = useAuth();
    const config = useRuntimeConfig();

    if (!tokenSet.value?.access_token) {
      loggedInUser.value = null;
      userLoaded.value = true;
      return null;
    }

    userLoading.value = true;

    try {
      const user = await useFetchApi(
        `${config.public.userManagerApiUrl}/v3/users/self`
      );

      loggedInUser.value = user;
      return user;
    } catch (error) {
      console.error('loadUser error:', error);
      loggedInUser.value = null;
      return null;
    } finally {
      userLoading.value = false;
      userLoaded.value = true;
    }
  };

  return {
    loggedInUser,
    userLoading,
    userLoaded,
    loadUser,
    setUser,
  };
};