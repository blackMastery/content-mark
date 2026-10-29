import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/admin";
import { readBlogDraft } from "@/lib/blog/content";
import { BlogArticle } from "@/components/blog/article";
export default async function BlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { client } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data, error } = await client
    .from("blog_posts")
    .select("id,document,revision,published_revision,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("This preview couldn't be loaded.");
  if (!data) notFound();
  const post = readBlogDraft(data);
  return (
    <div id="top">
      <div className="draft-preview-banner">
        <span>PRIVATE DRAFT PREVIEW · This version is not public.</span>
        <Link href={`/admin/blog/${id}`}>Return to editor ↗</Link>
      </div>
      <main id="main">
        <BlogArticle id={id} document={post.document} preview />
      </main>
    </div>
  );
}
