export default defineEventHandler(async (event) => {
  if (!event.node.req.url?.startsWith("/api")) {
    return;
  }
  const config = useRuntimeConfig(event);
  const authorization = getHeader(event, "Authorization");

  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authorization header not set",
    });
  }

  const response = await fetch(
    config.public.userManagerApiUrl + "/v3/users/self",
    {
      headers: { Authorization: authorization },
    }
  );

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: "Invalid authorization",
    });
  }

  const user = await response.json();
  (event.context as any).user = user;
});
