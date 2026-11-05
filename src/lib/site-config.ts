type SiteEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  SITE_INDEXING_ENABLED?: string;
};

/** Canonical public origin used by Vercel production when no override is set. */
export const PRODUCTION_SITE_URL = "https://www.contentmarkgy.com";

function configuredSiteUrl(env: SiteEnvironment) {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;
  return env.VERCEL_ENV === "production" ? PRODUCTION_SITE_URL : undefined;
}

function siteOrigin(configured?: string) {
  if (!configured?.trim()) return "http://localhost:3000";
  let url: URL;
  try {
    url = new URL(configured.trim());
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a complete HTTP(S) origin.");
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, a path, query, or fragment.",
    );
  }
  return url.origin;
}

export function siteConfiguration(env: SiteEnvironment = process.env) {
  const siteUrl = configuredSiteUrl(env);
  const origin = siteOrigin(siteUrl);
  const { hostname, protocol } = new URL(origin);
  const local =
    !hostname.includes(".") ||
    /(^|\.)(localhost|local|test|invalid)$/.test(hostname) ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
    hostname.includes(":");
  const configured = Boolean(siteUrl);
  if (
    env.SITE_INDEXING_ENABLED &&
    !["true", "false"].includes(env.SITE_INDEXING_ENABLED)
  ) {
    throw new Error(
      "SITE_INDEXING_ENABLED must be true or false when provided.",
    );
  }
  return {
    origin,
    canonicalUrl: configured ? `${origin}/` : undefined,
    indexable:
      configured &&
      !local &&
      protocol === "https:" &&
      env.NODE_ENV === "production" &&
      !["preview", "development"].includes(env.VERCEL_ENV || "") &&
      env.SITE_INDEXING_ENABLED !== "false",
  };
}

export type SiteConfiguration = ReturnType<typeof siteConfiguration>;
