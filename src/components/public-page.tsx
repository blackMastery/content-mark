import { SiteView } from "@/components/site-view";
import { getPublishedSite } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteStructuredData, serializeJsonLd } from "@/lib/seo/structured-data";
import type { SitePageKey } from "@/lib/site-pages";

export async function publicPageMetadata(page: SitePageKey) {
  const { document, revision } = await getPublishedSite();
  return pageMetadata(document, revision, page);
}

export async function PublicPage({ page }: { page: SitePageKey }) {
  const { document, publishedAt } = await getPublishedSite();
  const schema = siteStructuredData(document, undefined, publishedAt, page);
  return (
    <>
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ) : null}
      <SiteView site={document} page={page} />
    </>
  );
}
