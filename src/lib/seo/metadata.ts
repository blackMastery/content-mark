import type { Metadata } from "next";
import type { SiteDocument } from "@/lib/cms/schema";
import { siteConfiguration, type SiteConfiguration } from "@/lib/site-config";

export const privateRobots = {
  index: false,
  follow: false,
  noarchive: true,
  nosnippet: true,
  googleBot: { index: false, follow: false, noarchive: true, nosnippet: true },
} satisfies Metadata["robots"];

export function shareImageUrl(origin: string, revision: number) {
  return `${origin}/opengraph-image?v=${revision}`;
}

export function homeMetadata(
  site: SiteDocument,
  revision: number,
  config: SiteConfiguration = siteConfiguration(),
) {
  const title = site.settings.seoTitle;
  const description = site.settings.seoDescription;
  const images = [{
    url: shareImageUrl(config.origin, revision),
    width: 1200,
    height: 630,
    type: "image/png",
    alt: `Content Mark — ${site.hero.headline.join(" ")}`.slice(0, 420),
  }];
  return {
    title,
    description,
    alternates: { canonical: config.canonicalUrl ?? null },
    robots: config.indexable ? {
      index: true,
      follow: true,
      googleBot: {
        index: true, follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    } : privateRobots,
    openGraph: {
      title, description, type: "website", siteName: "Content Mark",
      locale: "en_GY", url: config.canonicalUrl, images,
    },
    twitter: { card: "summary_large_image", title, description, images },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : undefined,
    },
  } satisfies Metadata;
}
