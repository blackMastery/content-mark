import type { MetadataRoute } from "next";
import { siteConfiguration } from "@/lib/site-config";
import { getPublishedSite } from "@/lib/cms/content";
import { publicSitemap } from "@/lib/seo/crawlers";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = siteConfiguration();
  if (!config.indexable) return [];
  const { publishedAt } = await getPublishedSite();
  return publicSitemap(config, publishedAt);
}
