import assert from "node:assert/strict";
import { test } from "node:test";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
assert.ok(
  url && ["localhost", "127.0.0.1"].includes(new URL(url).hostname),
  "Integration tests only run against local Supabase.",
);
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const anonymous = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  options,
);
const service = createClient(url, process.env.SUPABASE_SECRET_KEY!, options);
const credentials = JSON.parse(
  readFileSync(".local/admin-credentials.json", "utf8"),
);
const admin = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  options,
);

test("local Supabase enforces published-only public access and approved-admin authorization", async () => {
  const { error: login } = await admin.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  assert.ifError(login);
  const published = await anonymous
    .from("site_content")
    .select("document")
    .eq("id", "main")
    .single();
  assert.ifError(published.error);
  assert.ok(published.data.document.hero);
  for (const table of ["admin_users", "site_drafts", "inquiries"]) {
    const result = await anonymous.from(table).select("*");
    assert.ok(
      result.error || result.data?.length === 0,
      `${table} must not be public`,
    );
  }
  const publicWrite = await anonymous
    .from("site_content")
    .update({ document: {} })
    .eq("id", "main");
  assert.ok(publicWrite.error);
  const publicRpc = await anonymous.rpc("save_site_document", {
    p_document: {},
    p_expected_revision: 1,
    p_publish: true,
  });
  assert.ok(publicRpc.error);
  const memberWrite = await admin
    .from("admin_users")
    .insert({ user_id: randomUUID() });
  assert.ok(
    memberWrite.error,
    "Admins cannot grant themselves or others access through the public API",
  );
  const signup = await anonymous.auth.signUp({
    email: `unapproved-${randomUUID()}@example.com`,
    password: randomBytes(20).toString("hex"),
  });
  if (signup.data.user)
    await service.auth.admin.deleteUser(signup.data.user.id);
  assert.ok(signup.error, "Public account registration must stay disabled");

  const password = randomBytes(20).toString("hex");
  const { data: created, error: createError } =
    await service.auth.admin.createUser({
      email: `nonadmin-${randomUUID()}@example.com`,
      password,
      email_confirm: true,
      user_metadata: { is_admin: true, role: "admin" },
    });
  assert.ifError(createError);
  const outsider = createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    options,
  );
  try {
    const auth = await outsider.auth.signInWithPassword({
      email: created.user!.email!,
      password,
    });
    assert.ifError(auth.error);
    for (const table of ["site_drafts", "inquiries"]) {
      const result = await outsider.from(table).select("*");
      assert.ok(
        result.error || result.data?.length === 0,
        "A signed-in non-admin must be denied",
      );
    }
    const denied = await outsider.rpc("save_site_document", {
      p_document: published.data.document,
      p_expected_revision: 1,
      p_publish: true,
    });
    assert.ok(denied.error);
  } finally {
    await outsider.auth.signOut();
    await service.auth.admin.deleteUser(created.user!.id);
  }
});

test("draft writes use optimistic concurrency and never change the public site until publication", async () => {
  const draft = await admin
    .from("site_drafts")
    .select("document,revision,published_revision")
    .eq("id", "main")
    .single();
  assert.ifError(draft.error);
  if (draft.data.revision !== draft.data.published_revision) return; // Preserve any real unpublished work.
  const publicBefore = await anonymous
    .from("site_content")
    .select("document")
    .eq("id", "main")
    .single();
  assert.ifError(publicBefore.error);
  const staged = {
    ...draft.data.document,
    hero: {
      ...draft.data.document.hero,
      eyebrow: "PRIVATE INTEGRATION TEST DRAFT",
    },
  };
  const saved = await admin.rpc("save_site_document", {
    p_document: staged,
    p_expected_revision: draft.data.revision,
    p_publish: false,
  });
  assert.ifError(saved.error);
  try {
    const visible = await anonymous
      .from("site_content")
      .select("document")
      .eq("id", "main")
      .single();
    assert.deepEqual(visible.data?.document, publicBefore.data.document);
    const stale = await admin.rpc("save_site_document", {
      p_document: staged,
      p_expected_revision: draft.data.revision,
      p_publish: false,
    });
    assert.equal(stale.error?.code, "40001");
  } finally {
    const restored = await admin.rpc("save_site_document", {
      p_document: draft.data.document,
      p_expected_revision: saved.data,
      p_publish: true,
    });
    assert.ifError(restored.error);
  }
});

test("inquiries are durable and private, searchable, and manageable by an approved admin", async () => {
  const { data, error } = await service
    .from("inquiries")
    .insert({
      name: "CMS Integration Test",
      business: "Disposable Integration Fixture",
      email: "fixture@example.com",
      phone: "+5926000000",
      service: "Website Development",
      budget: "Let's discuss",
      description:
        "An isolated integration fixture used to verify inquiry access.",
    })
    .select("id,updated_at")
    .single();
  assert.ifError(error);
  try {
    const hidden = await anonymous
      .from("inquiries")
      .select("id")
      .eq("id", data.id);
    assert.ok(hidden.error || hidden.data?.length === 0);
    const found = await admin
      .from("inquiries")
      .select("id")
      .textSearch("search_text", "Disposable", {
        type: "websearch",
        config: "simple",
      });
    assert.ifError(found.error);
    assert.ok(found.data.some((row) => row.id === data.id));
    const changed = await admin
      .from("inquiries")
      .update({ status: "qualified", notes: "Private integration note" })
      .eq("id", data.id)
      .select("status,notes")
      .single();
    assert.ifError(changed.error);
    assert.equal(changed.data.status, "qualified");
  } finally {
    await service.from("inquiries").delete().eq("id", data.id);
  }
});

test("only approved administrators can upload media; website assets have public read access", async () => {
  const bytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6lV8AAAAASUVORK5CYII=",
    "base64",
  );
  const path = `integration/${randomUUID()}.png`;
  const denied = await anonymous.storage
    .from("site-media")
    .upload(path, bytes, { contentType: "image/png" });
  assert.ok(denied.error);
  const uploaded = await admin.storage
    .from("site-media")
    .upload(path, bytes, { contentType: "image/png" });
  assert.ifError(uploaded.error);
  try {
    const { data } = admin.storage.from("site-media").getPublicUrl(path);
    assert.equal((await fetch(data.publicUrl)).status, 200);
  } finally {
    await service.storage.from("site-media").remove([path]);
  }
  await admin.auth.signOut({ scope: "local" });
});
