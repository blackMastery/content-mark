import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { createClient } from "@supabase/supabase-js";
import {
  portfolioHeading,
  portfolioProjects,
  portfolioSource,
} from "../src/data/portfolio";
import { siteDocumentSchema } from "../src/lib/cms/schema";

function jsonSql(value: unknown) {
  const encoded = Buffer.from(JSON.stringify(value)).toString("base64");
  return `convert_from(decode('${encoded}', 'base64'), 'UTF8')::jsonb`;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  const origin = new URL(url).origin;
  const isLocal = ["localhost", "127.0.0.1"].includes(new URL(url).hostname);
  if (
    !isLocal &&
    (!origin.startsWith("https://") ||
      !process.argv.includes(`--target=${origin}`))
  ) {
    throw new Error(
      "For hosted Supabase, explicitly pass --target=<configured HTTPS Supabase origin>.",
    );
  }
  const configuration = await readFile("supabase/config.toml", "utf8");
  const project = configuration.match(
    /^project_id\s*=\s*"([a-z0-9_-]+)"/m,
  )?.[1];
  if (!project) throw new Error("Local Supabase project ID was not found.");
  const container = `supabase_db_${project}`;
  const label = isLocal
    ? execFileSync(
        "docker",
        [
          "inspect",
          container,
          "--format",
          '{{index .Config.Labels "com.supabase.cli.project"}}',
        ],
        { encoding: "utf8" },
      ).trim()
    : undefined;
  if (isLocal)
    assert.equal(
      label,
      project,
      "Refusing to modify a database belonging to another project",
    );
  const client = createClient(url, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(15000) }),
    },
  });
  async function read(table: "site_content" | "site_drafts") {
    const { data, error } = await client
      .from(table)
      .select("*")
      .eq("id", "main")
      .single();
    if (error) throw error;
    assert.ok(Number.isSafeInteger(data.revision) && data.revision > 0);
    return data;
  }
  const [published, draft] = await Promise.all([
    read("site_content"),
    read("site_drafts"),
  ]);
  for (const row of [published, draft]) {
    siteDocumentSchema.parse({
      ...row.document,
      projects: portfolioProjects,
      headings: { ...row.document.headings, work: portfolioHeading },
    });
  }
  if (
    [published, draft].every(
      (row) =>
        isDeepStrictEqual(row.document.projects, portfolioProjects) &&
        isDeepStrictEqual(row.document.headings.work, portfolioHeading),
    )
  ) {
    console.log(
      "The nine-project portfolio is already imported. No content changed.",
    );
    return;
  }
  await mkdir(".local", { recursive: true });
  const backup = `.local/portfolio-before-import-${Date.now()}.json`;
  await writeFile(
    backup,
    JSON.stringify(
      { target: origin, source: portfolioSource, published, draft },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  // Match the publisher's lock order. Update only portfolio fields in each document;
  // unrelated unpublished changes never enter the published document.
  const sql = `BEGIN;
DO $import$
BEGIN
  PERFORM 1 FROM public.site_drafts WHERE id='main' FOR UPDATE;
  PERFORM 1 FROM public.site_content WHERE id='main' FOR UPDATE;
  IF NOT EXISTS (SELECT 1 FROM public.site_drafts WHERE id='main' AND revision=${draft.revision} AND updated_at=(${jsonSql(draft.updated_at)}#>>'{}')::timestamptz)
    OR NOT EXISTS (SELECT 1 FROM public.site_content WHERE id='main' AND revision=${published.revision} AND updated_at=(${jsonSql(published.updated_at)}#>>'{}')::timestamptz) THEN
    RAISE EXCEPTION 'Content changed while preparing the import. Rerun after reviewing the latest content.';
  END IF;
END $import$;
UPDATE public.site_content SET document=jsonb_set(jsonb_set(document,'{projects}',${jsonSql(portfolioProjects)}),'{headings,work}',${jsonSql(portfolioHeading)}), revision=revision+1, updated_at=now() WHERE id='main';
UPDATE public.site_drafts SET document=jsonb_set(jsonb_set(document,'{projects}',${jsonSql(portfolioProjects)}),'{headings,work}',${jsonSql(portfolioHeading)}), published_revision=CASE WHEN revision=published_revision THEN revision+1 ELSE published_revision END, revision=revision+1, updated_at=now(), updated_by=NULL WHERE id='main';
COMMIT;`;
  if (isLocal)
    execFileSync(
      "docker",
      [
        "exec",
        "-i",
        container,
        "psql",
        "-X",
        "-q",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-v",
        "ON_ERROR_STOP=1",
      ],
      { input: sql, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    );
  else {
    const withPortfolio = (document: Record<string, unknown>) => ({
      ...document,
      projects: portfolioProjects,
      headings: {
        ...(document.headings as Record<string, unknown>),
        work: portfolioHeading,
      },
    });
    async function update(
      table: "site_content" | "site_drafts",
      before: typeof draft,
      document: unknown,
      extra: Record<string, unknown> = {},
    ) {
      const { data, error } = await client
        .from(table)
        .update({
          document,
          revision: before.revision + 1,
          updated_at: new Date().toISOString(),
          ...extra,
        })
        .eq("id", "main")
        .eq("revision", before.revision)
        .eq("updated_at", before.updated_at)
        .select("*")
        .single();
      if (error)
        throw new Error(
          `${table} update failed or its revision changed: ${error.message}`,
        );
      return data;
    }
    // Hosted writes use the server-only key and compare-and-swap guards. Never
    // publish the whole private draft just to change these two portfolio fields.
    const changedDraft = await update(
      "site_drafts",
      draft,
      withPortfolio(draft.document),
      {
        published_revision:
          draft.revision === draft.published_revision
            ? draft.revision + 1
            : draft.published_revision,
        updated_by: null,
      },
    );
    try {
      await update(
        "site_content",
        published,
        withPortfolio(published.document),
      );
    } catch (error) {
      const currentPublic = await read("site_content");
      const committed =
        currentPublic.revision === published.revision + 1 &&
        isDeepStrictEqual(
          currentPublic.document,
          withPortfolio(published.document),
        );
      if (!committed) {
        const currentDraft = await read("site_drafts");
        if (
          currentDraft.revision === changedDraft.revision &&
          isDeepStrictEqual(currentDraft.document, changedDraft.document)
        ) {
          await update("site_drafts", currentDraft, draft.document, {
            published_revision:
              draft.revision === draft.published_revision
                ? currentDraft.revision + 1
                : draft.published_revision,
            updated_by: draft.updated_by,
          });
        }
        throw error;
      }
    }
  }
  function withoutPortfolio(document: Record<string, unknown>) {
    const copy = structuredClone(document);
    delete copy.projects;
    delete (copy.headings as Record<string, unknown>).work;
    return copy;
  }
  for (const [table, before] of [
    ["site_content", published],
    ["site_drafts", draft],
  ] as const) {
    const after = await read(table);
    assert.deepEqual(after.document.projects, portfolioProjects);
    assert.deepEqual(after.document.headings.work, portfolioHeading);
    assert.deepEqual(
      withoutPortfolio(after.document),
      withoutPortfolio(before.document),
    );
  }
  console.log(
    `Imported ${portfolioProjects.length} website projects into the configured published content and draft. Other content was preserved. Backup: ${backup}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
