import type { NextConfig } from "next";
import { siteConfiguration } from "./src/lib/site-config";
const config: NextConfig = {
  poweredByHeader: false,
  experimental: { optimizePackageImports: ["lucide-react"] },
  async redirects() {
    // Consolidate the apex domain onto the canonical www origin.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "contentmarkgy.com" }],
        destination: "https://www.contentmarkgy.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          ...(!siteConfiguration().indexable
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]
            : []),
        ],
      },
      ...["/admin/:path*", "/api/:path*"].map((source) => ({
        source,
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      })),
    ];
  },
};
export default config;
