import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/admin";
import { BlogEditor } from "@/components/admin/blog-editor";
import { emptyBlog } from "@/lib/blog/schema";
import { readBlogDraft } from "@/lib/blog/content";
export default async function BlogEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { client } = await requireAdmin();
  if (id === "new")
    return (
      <BlogEditor
        initial={{
          id: randomUUID(),
          document: emptyBlog,
          revision: 0,
          publishedRevision: null,
          updatedAt: new Date().toISOString(),
        }}
      />
    );
  if (!z.uuid().safeParse(id).success) notFound();
  const { data, error } = await client
    .from("blog_posts")
    .select("id,document,revision,published_revision,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("This draft couldn't be loaded.");
  if (!data) notFound();
  return <BlogEditor key={id} initial={readBlogDraft(data)} />;
}
