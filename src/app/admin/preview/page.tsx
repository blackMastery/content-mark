import { BlogIndex } from "@/components/blog/article";
import { getPublishedArticles } from "@/lib/blog/content";
import { requireAdmin } from "@/lib/supabase/admin";
import { siteDocumentSchema } from "@/lib/cms/schema";
import { SiteView } from "@/components/site-view";
import { sitePages } from "@/lib/site-pages";
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = (await searchParams).page;
  const page =
    sitePages.find((page) => page.key === requestedPage)?.key ?? "home";
  const { client } = await requireAdmin();
  const { data, error } = await client
    .from("site_drafts")
    .select("document")
    .eq("id", "main")
    .single();
  if (error) throw new Error("The draft couldn't be loaded.");
  return (
    <SiteView
      site={siteDocumentSchema.parse(data.document)}
      preview
      page={page}
    >
      {page === "blog" ? (
        <BlogIndex articles={await getPublishedArticles()} />
      ) : null}
    </SiteView>
  );
}
