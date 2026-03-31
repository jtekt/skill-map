declare module "#oidc-auth" {
  interface UserSession {
    userInfo: UserInfo;
    accessToken: string;
    refreshToken: string;
  }
}
