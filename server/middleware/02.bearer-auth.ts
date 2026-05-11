export default defineEventHandler(async (event) => {
  if (isAuthDisabled()) {
    return;
  }

  if (!event.path.startsWith("/api/") || event.path.startsWith("/api/auth"))
    return;

  // If session auth already succeeded, don't do anything
  if (event.context.auth) return;

  const header = getHeader(event, "authorization");
  if (!header?.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const token = header.slice(7);

  try {
    const user = await verifyKeycloakTokenJwt(event, token);
    event.context.auth = { type: "bearer", user };
  } catch (err) {
    console.log(err);
    throw createError({ statusCode: 401, statusMessage: "Invalid token" });
  }
});
