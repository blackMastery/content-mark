"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  blogDraftSchema,
  publishableBlogSchema,
  blogMediaPaths,
} from "@/lib/blog/schema";

const identity = z.object({
  id: z.uuid(),
  revision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
});
function blogChanged() {
  revalidatePath("/blog", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog", "layout");
}
function saveError(code?: string) {
  if (code === "40001")
    return "Another session saved changes. Reload before editing further.";
  if (code === "23505")
    return "This URL slug is already used by another published article. Choose a different one.";
  return "The article couldn't be saved. Please try again.";
}
export async function saveBlogPost(
  input: unknown,
  document: unknown,
  publish: boolean,
) {
  const { client } = await requireAdmin();
  const parsedIdentity = identity.safeParse(input);
  const parsed = (publish ? publishableBlogSchema : blogDraftSchema).safeParse(
    document,
  );
  if (!parsedIdentity.success || typeof publish !== "boolean")
    return { error: "Invalid article. Reload the editor." };
  if (!parsed.success)
    return {
      error: parsed.error.issues
        .slice(0, 4)
        .map((issue) => issue.message)
        .join(" · "),
    };
  const { id, revision } = parsedIdentity.data;
  const paths = blogMediaPaths(parsed.data);
  if (paths.some((path) => !path.startsWith(`${id}/`)))
    return { error: "Use media uploaded to this article." };
  if (paths.length) {
    const { data, error } = await client.storage
      .from("blog-media")
      .list(id, { limit: 200 });
    if (
      error ||
      paths.some((path) => !data?.some((file) => `${id}/${file.name}` === path))
    )
      return {
        error: "Some media files are missing. Upload them again before saving.",
      };
  }
  const { data, error } = await client.rpc("save_blog_post", {
    p_id: id,
    p_document: parsed.data,
    p_expected_revision: revision,
    p_publish: publish,
  });
  if (error) return { error: saveError(error.code) };
  blogChanged();
  return { revision: Number(data), savedAt: new Date().toISOString() };
}
export async function unpublishBlogPost(input: unknown) {
  const { client } = await requireAdmin();
  const parsed = identity.safeParse(input);
  if (!parsed.success) return { error: "Invalid article. Reload the editor." };
  const { data, error } = await client.rpc("unpublish_blog_post", {
    p_id: parsed.data.id,
    p_expected_revision: parsed.data.revision,
  });
  if (error) return { error: saveError(error.code) };
  blogChanged();
  return { revision: Number(data) };
}
export async function deleteBlogDraft(input: unknown) {
  const { client } = await requireAdmin();
  const parsed = identity.safeParse(input);
  if (!parsed.success) return { error: "Invalid article. Reload the editor." };
  const { data, error } = await client
    .from("blog_posts")
    .delete()
    .eq("id", parsed.data.id)
    .eq("revision", parsed.data.revision)
    .is("published_revision", null)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return {
      error:
        "Only an unpublished draft can be deleted. Reload to see its current status.",
    };
  blogChanged();
  return { success: true };
}
