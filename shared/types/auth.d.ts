declare module "#auth-utils" {
  interface User {
    sub?: string;
    name?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
    isAdmin?: boolean;
  }

  interface UserSession {
    user?: User;
    tokens?: {
      access_token?: string;
      refresh_token?: string;
      expires_at: number; // Timestamp in milliseconds
    };
  }
}

export {};
