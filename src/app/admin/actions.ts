"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { inquiryStatuses, siteDocumentSchema } from "@/lib/cms/schema";

export async function signIn(_previous: { error: string }, form: FormData) {
  const credentials = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse({ email: form.get("email"), password: form.get("password") });
  if (!credentials.success)
    return { error: "Enter your email address and password." };
  try {
    const client = await createServerSupabase();
    const { data, error } = await client.auth.signInWithPassword(
      credentials.data,
    );
    if (error || !data.user)
      return {
        error: "We couldn't sign you in. Check your email and password.",
      };
    const { data: member } = await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (!member) {
      await client.auth.signOut();
      return { error: "This account does not have administrator access." };
    }
  } catch {
    return {
      error:
        "The sign-in service is unavailable. Check that local Supabase is running.",
    };
  }
  redirect("/admin");
}
export async function signOut() {
  const client = await createServerSupabase();
  await client.auth.signOut();
  redirect("/admin/login");
}
export async function saveSiteDocument(
  document: unknown,
  revision: number,
  publish: boolean,
) {
  const { client } = await requireAdmin();
  if (!Number.isSafeInteger(revision) || revision < 1)
    return { error: "Invalid revision. Reload the editor." };
  const result = siteDocumentSchema.safeParse(document);
  if (!result.success)
    return {
      error: result.error.issues
        .map((i) => `${i.path.join(" → ")}: ${i.message}`)
        .slice(0, 5)
        .join(" · "),
    };
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (
    result.data.projects.some(
      (p) =>
        p.imageUrl &&
        !p.imageUrl.startsWith(`${base}/storage/v1/object/public/site-media/`),
    )
  )
    return {
      error: "Project images must be uploaded to this site's media storage.",
    };
  const { data, error } = await client.rpc("save_site_document", {
    p_document: result.data,
    p_expected_revision: revision,
    p_publish: publish,
  });
  if (error)
    return {
      error:
        error.code === "40001"
          ? "Another session has saved newer changes. Reload this page before editing further."
          : "Your changes couldn't be saved. Please try again.",
    };
  if (publish) revalidatePath("/");
  revalidatePath("/admin");
  return { revision: Number(data), savedAt: new Date().toISOString() };
}
export async function updateInquiry(input: unknown) {
  const { client } = await requireAdmin();
  const parsed = z
    .object({
      id: z.uuid(),
      status: z.enum(inquiryStatuses as [string, ...string[]]),
      notes: z.string().max(10000),
      updatedAt: z.iso.datetime({ offset: true }),
    })
    .safeParse(input);
  if (!parsed.success)
    return { error: "Check the inquiry details and try again." };
  const { id, status, notes, updatedAt } = parsed.data;
  const { data, error } = await client
    .from("inquiries")
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("updated_at", updatedAt)
    .select("id,updated_at")
    .maybeSingle();
  if (error)
    return { error: "The inquiry couldn't be updated. Please try again." };
  if (!data)
    return {
      error:
        "This inquiry was updated elsewhere. Reload to see the latest version.",
    };
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  return { updatedAt: data.updated_at as string };
}
