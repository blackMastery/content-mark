import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

// The server uses this key for public inquiries and signed access to blog media.
// Media signing first checks the publication or authenticated draft. CMS edits
// always use the signed-in admin's own session and database RLS policies.
export function createServiceSupabase() {
  const { url } = supabaseConfig();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("The server's Supabase key is not configured.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(10000) }),
    },
  });
}
