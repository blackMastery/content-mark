import { requireAdmin } from "@/lib/supabase/admin";
import { siteDocumentSchema } from "@/lib/cms/schema";
import { SiteView } from "@/components/site-view";
export default async function PreviewPage() {
  const { client } = await requireAdmin();
  const { data, error } = await client
    .from("site_drafts")
    .select("document")
    .eq("id", "main")
    .single();
  if (error) throw new Error("The draft couldn't be loaded.");
  return <SiteView site={siteDocumentSchema.parse(data.document)} preview />;
}
