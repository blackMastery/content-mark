type SiteEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  SITE_INDEXING_ENABLED?: string;
};

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
    url.username || url.password || url.pathname !== "/" || url.search || url.hash
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, a path, query, or fragment.");
  }
  return url.origin;
}

export function siteConfiguration(env: SiteEnvironment = process.env) {
  const origin = siteOrigin(env.NEXT_PUBLIC_SITE_URL);
  const { hostname, protocol } = new URL(origin);
  const local = !hostname.includes(".") ||
    /(^|\.)(localhost|local|test|invalid)$/.test(hostname) ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");
  const configured = Boolean(env.NEXT_PUBLIC_SITE_URL?.trim());
  if (env.SITE_INDEXING_ENABLED && !["true", "false"].includes(env.SITE_INDEXING_ENABLED)) {
    throw new Error("SITE_INDEXING_ENABLED must be true or false when provided.");
  }
  return {
    origin,
    canonicalUrl: configured ? `${origin}/` : undefined,
    indexable: configured && !local && protocol === "https:" &&
      env.NODE_ENV === "production" &&
      !["preview", "development"].includes(env.VERCEL_ENV || "") &&
      env.SITE_INDEXING_ENABLED !== "false",
  };
}

export type SiteConfiguration = ReturnType<typeof siteConfiguration>;
