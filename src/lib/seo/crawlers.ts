import type { MetadataRoute } from "next";
import type { SiteConfiguration } from "@/lib/site-config";
import { sitePages } from "@/lib/site-pages";

export function crawlerRules(config: SiteConfiguration): MetadataRoute.Robots {
  return {
    // Let crawlers read the admin/login noindex response; authentication protects drafts.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ...(config.indexable ? { sitemap: `${config.origin}/sitemap.xml` } : {}),
  };
}

export function publicSitemap(
  config: SiteConfiguration,
  publishedAt?: string,
): MetadataRoute.Sitemap {
  if (!config.indexable) return [];
  return sitePages.map((page) => ({
    url: `${config.origin}${page.path}`,
    ...(publishedAt ? { lastModified: publishedAt } : {}),
  }));
}
