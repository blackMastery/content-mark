import type { Metadata } from "next";
import { SiteView } from "@/components/site-view";
import { getPublishedSite } from "@/lib/cms/content";
import { homeMetadata } from "@/lib/seo/metadata";
import { siteStructuredData, serializeJsonLd } from "@/lib/seo/structured-data";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { document, revision } = await getPublishedSite();
  return homeMetadata(document, revision);
}
export default async function Home() {
  const { document, publishedAt } = await getPublishedSite();
  const schema = siteStructuredData(document, undefined, publishedAt);
  return <>
    {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} /> : null}
    <SiteView site={document} />
  </>;
}
