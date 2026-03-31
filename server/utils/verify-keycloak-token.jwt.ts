import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import type { H3Event } from "h3";

const clientCache = new Map<string, jwksRsa.JwksClient>();

function getClient(issuer: string) {
  if (!clientCache.has(issuer)) {
    clientCache.set(
      issuer,
      jwksRsa({
        jwksUri: `${issuer}/protocol/openid-connect/certs`,
        cache: true, // Cache the keys for better performance
        cacheMaxAge: 86400000, // 24 hours
        rateLimit: true,
        jwksRequestsPerMinute: 10, // Max 10 JWKS requests per minute
      }),
    );
  }
  return clientCache.get(issuer)!;
}

export async function verifyKeycloakTokenJwt(
  event: H3Event,
  token: string,
): Promise<any> {
  const config = useRuntimeConfig(event);

  const issuer = config.oidc.providers.keycloak.baseUrl;
  const audience = config.oidc.providers.keycloak.audience;

  if (!issuer || !audience) {
    throw new Error("Keycloak runtime config missing");
  }

  const client = getClient(issuer);

  const decoded = await new Promise<any>((resolve, reject) => {
    jwt.verify(
      token,
      (header, callback) => {
        if (!header.kid) {
          callback(new Error("Missing kid"));
          return;
        }

        client.getSigningKey(header.kid, (err, key) => {
          if (err || !key) {
            callback(err ?? new Error("Signing key not found"));
            return;
          }

          callback(null, key.getPublicKey());
        });
      },
      {
        algorithms: ["RS256"],
      },
      (err, payload) => {
        if (err) reject(err);
        else resolve(payload);
      },
    );
  });

  return decoded;
}
