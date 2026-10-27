import type { Metadata } from "next";
import { SiteView } from "@/components/site-view";
import { getSiteDocument } from "@/lib/cms/content";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteDocument();
  return {
    title: site.settings.seoTitle,
    description: site.settings.seoDescription,
    openGraph: {
      title: site.settings.seoTitle,
      description: site.settings.seoDescription,
    },
    twitter: {
      title: site.settings.seoTitle,
      description: site.settings.seoDescription,
    },
  };
}
export default async function Home() {
  return <SiteView site={await getSiteDocument()} />;
}
