export default function () {
  const loggedInUser = useState<any | undefined>("auth_user");

  const setUser = (newUser: any | undefined) => {
    loggedInUser.value = newUser;
  };

  return {
    loggedInUser,
    setUser,
  };
}
