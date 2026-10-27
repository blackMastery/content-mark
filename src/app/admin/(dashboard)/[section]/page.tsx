import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { siteDocumentSchema } from "@/lib/cms/schema";
import { ContentEditor, type EditorMode } from "@/components/admin/editor";

const modes = ["content", "projects", "pricing", "faqs", "settings"];
export default async function EditorPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!modes.includes(section)) notFound();
  const { client } = await requireAdmin();
  const { data, error } = await client
    .from("site_drafts")
    .select("document,revision,published_revision,updated_at")
    .eq("id", "main")
    .single();
  if (error) throw new Error("The site draft couldn't be loaded.");
  return (
    <ContentEditor
      key={section}
      mode={section as EditorMode}
      initial={siteDocumentSchema.parse(data.document)}
      revision={Number(data.revision)}
      publishedRevision={Number(data.published_revision)}
      updatedAt={data.updated_at}
    />
  );
}
