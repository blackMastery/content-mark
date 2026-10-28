import type { MetadataRoute } from "next";
import { siteConfiguration } from "@/lib/site-config";
import { crawlerRules } from "@/lib/seo/crawlers";
export default function robots(): MetadataRoute.Robots {
  return crawlerRules(siteConfiguration());
}
