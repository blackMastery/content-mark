import { BlogIndex } from "@/components/blog/article";
import { SiteView } from "@/components/site-view";
import { getPublishedArticles } from "@/lib/blog/content";
import { getPublishedSite } from "@/lib/cms/content";
import { publicPageMetadata } from "@/components/public-page";
export const dynamic = "force-dynamic";
export const generateMetadata = () => publicPageMetadata("blog");
export default async function BlogPage() {
  const [site, articles] = await Promise.all([
    getPublishedSite(),
    getPublishedArticles(),
  ]);
  return (
    <SiteView site={site.document} page="blog">
      <BlogIndex articles={articles} />
    </SiteView>
  );
}
