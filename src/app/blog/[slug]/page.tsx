import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/article";
import { SiteView } from "@/components/site-view";
import { getPublishedArticle } from "@/lib/blog/content";
import { getPublishedSite } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteConfiguration } from "@/lib/site-config";
import { serializeJsonLd } from "@/lib/seo/structured-data";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const post = await getPublishedArticle((await params).slug);
  if (!post) notFound();
  const site = await getPublishedSite();
  const base = pageMetadata(site.document, site.revision, "blog");
  const url = siteConfiguration().canonicalUrl
    ? `${siteConfiguration().origin}/blog/${post.slug}`
    : undefined;
  const title = `${post.document.title} | Content Mark`;
  const description = post.document.excerpt;
  return {
    ...base,
    title,
    description,
    alternates: { canonical: url ?? null },
    openGraph: {
      ...base.openGraph,
      title,
      description,
      url,
      type: "article" as const,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: ["Content Mark"],
    },
    twitter: { ...base.twitter, title, description },
  };
}
export default async function ArticlePage({ params }: Props) {
  const [post, site] = await Promise.all([
    getPublishedArticle((await params).slug),
    getPublishedSite(),
  ]);
  if (!post) notFound();
  const config = siteConfiguration();
  const schema = config.canonicalUrl
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.document.title,
        description: post.document.excerpt,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        url: `${config.origin}/blog/${post.slug}`,
        author: {
          "@type": "Organization",
          name: "Content Mark",
          url: config.canonicalUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "Content Mark",
          url: config.canonicalUrl,
        },
      }
    : null;
  return (
    <SiteView site={site.document} page="blog">
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ) : null}
      <BlogArticle {...post} />
    </SiteView>
  );
}
