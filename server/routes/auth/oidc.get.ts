export default defineOAuthOidcEventHandler({
  async onSuccess(event, data) {
    const {
      user,
      tokens: { access_token, refresh_token, expires_in },
    } = data;

    await setUserSession(event, {
      user,
      tokens: {
        access_token,
        refresh_token,
        expires_at: Date.now() + (expires_in ?? 5 * 60) * 1000,
      },
    });
    return sendRedirect(event, "/");
  },

  onError(event, error) {
    console.error("OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
