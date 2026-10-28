import { createClient } from "@supabase/supabase-js";
import { defaultSiteDocument } from "../src/lib/cms/defaults";

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  const isLocal = ["127.0.0.1", "localhost"].includes(new URL(url).hostname);
  if (!isLocal && process.env.ALLOW_REMOTE_SEED !== "1")
    throw new Error(
      "Seed is restricted to the local development database. Set ALLOW_REMOTE_SEED=1 to seed a hosted project.",
    );
  const client = createClient(url, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  for (const table of ["site_content", "site_drafts"]) {
    const { error } = await client
      .from(table)
      .upsert(
        { id: "main", document: defaultSiteDocument },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (error) throw error;
  }
  console.log(
    "Existing landing page content seeded. Existing edits were preserved.",
  );
}
seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
