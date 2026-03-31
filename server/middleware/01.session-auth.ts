import { requireUserSession } from "nuxt-oidc-auth/runtime/server/utils/session.js";

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith("/api/") || event.path.startsWith("/api/auth"))
    return;

  try {
    const session = await requireUserSession(event);
    event.context.auth = { type: "session", user: session.profile, session };
    return;
  } catch (_) {
    // No session — that's okay, fall through and let bearer auth handle it
  }
});
