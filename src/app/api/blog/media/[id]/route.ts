import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/supabase/admin";
import { createServiceSupabase } from "@/lib/supabase/service";
import { publicBlogClient } from "@/lib/blog/content";
import { blogDraftSchema, blogMediaPaths } from "@/lib/blog/schema";
export const dynamic = "force-dynamic";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const path = request.nextUrl.searchParams.get("path") || "";
  const preview = request.nextUrl.searchParams.get("preview") === "1";
  const fail = (status: number) =>
    new NextResponse(null, {
      status,
      headers: { "Cache-Control": "private, no-store" },
    });
  if (!z.uuid().safeParse(id).success || !path.startsWith(`${id}/`))
    return fail(404);
  try {
    const admin = preview ? await getAdmin() : null;
    if (preview && !admin) return fail(401);
    const client = admin?.client || publicBlogClient();
    const { data, error } = await client
      .from(preview ? "blog_posts" : "blog_publications")
      .select("document")
      .eq("id", id)
      .maybeSingle();
    if (error) return fail(503);
    const parsed = blogDraftSchema.safeParse(data?.document);
    if (!parsed.success || !blogMediaPaths(parsed.data).includes(path))
      return fail(404);
    const signed = await createServiceSupabase()
      .storage.from("blog-media")
      .createSignedUrl(path, 3600);
    if (signed.error) return fail(404);
    return NextResponse.redirect(signed.data.signedUrl, {
      status: 307,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return fail(503);
  }
}
