import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { defaultSiteDocument } from "./defaults";
import { siteDocumentSchema } from "./schema";
import { supabaseConfigured, supabaseConfig } from "@/lib/supabase/config";

export const getPublishedSite = cache(async () => {
  if (!supabaseConfigured()) return { document: defaultSiteDocument, revision: 0, publishedAt: undefined };
  const { url, key } = supabaseConfig();
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }),
    },
  });
  const { data, error } = await client
    .from("site_content")
    .select("document, revision, updated_at")
    .eq("id", "main")
    .single();
  if (error)
    throw new Error(
      "Site content is temporarily unavailable. Check the local Supabase services.",
    );
  return {
    document: siteDocumentSchema.parse(data.document),
    revision: Number(data.revision),
    publishedAt: new Date(data.updated_at).toISOString(),
  };
});

export const getSiteDocument = cache(async () => (await getPublishedSite()).document);
