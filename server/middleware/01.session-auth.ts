export default defineEventHandler(async (event) => {
  if (!event.path.startsWith("/api/") || event.path.startsWith("/api/auth"))
    return;

  const session = await getUserSession(event);

  if (session) {
    event.context.auth = {
      type: "session",
      user: session.user,
      session,
    };
  }

  // no throw → let bearer middleware handle it
});
