import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { supabaseConfig, supabaseConfigured } from "@/lib/supabase/config";
import {
  blogDraftSchema,
  publishableBlogSchema,
  type BlogDocument,
} from "./schema";

export type PublishedArticle = {
  id: string;
  slug: string;
  document: BlogDocument;
  publishedAt: string;
  updatedAt: string;
};
export type BlogDraft = {
  id: string;
  document: BlogDocument;
  revision: number;
  publishedRevision: number | null;
  updatedAt: string;
};
export function publicBlogClient() {
  const { url, key } = supabaseConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }),
    },
  });
}
export function readBlogDraft(row: Record<string, unknown>): BlogDraft {
  return {
    id: String(row.id),
    document: blogDraftSchema.parse(row.document),
    revision: Number(row.revision),
    publishedRevision:
      row.published_revision === null ? null : Number(row.published_revision),
    updatedAt: String(row.updated_at),
  };
}
function readPublication(row: Record<string, unknown>): PublishedArticle {
  return {
    id: String(row.id),
    slug: String(row.slug),
    document: publishableBlogSchema.parse(row.document),
    publishedAt: String(row.published_at),
    updatedAt: String(row.updated_at),
  };
}
export const getPublishedArticles = cache(async () => {
  if (!supabaseConfigured()) return [];
  const { data, error } = await publicBlogClient()
    .from("blog_publications")
    .select("id,slug,document,published_at,updated_at")
    .order("published_at", { ascending: false });
  if (error)
    throw new Error("Articles couldn't be loaded. Please try again shortly.");
  return data.map(readPublication);
});
export const getPublishedArticle = cache(async (slug: string) => {
  if (!supabaseConfigured() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    return null;
  const { data, error } = await publicBlogClient()
    .from("blog_publications")
    .select("id,slug,document,published_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error)
    throw new Error(
      "This article couldn't be loaded. Please try again shortly.",
    );
  return data ? readPublication(data) : null;
});
