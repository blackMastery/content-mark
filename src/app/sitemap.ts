import { getPublishedArticles } from "@/lib/blog/content";
import type { MetadataRoute } from "next";
import { siteConfiguration } from "@/lib/site-config";
import { getPublishedSite } from "@/lib/cms/content";
import { publicSitemap } from "@/lib/seo/crawlers";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = siteConfiguration();
  if (!config.indexable) return [];
  const [site, articles] = await Promise.all([
    getPublishedSite(),
    getPublishedArticles(),
  ]);
  return [
    ...publicSitemap(config, site.publishedAt),
    ...articles.map((post) => ({
      url: `${config.origin}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ];
}
