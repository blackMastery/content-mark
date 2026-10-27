import "server-only";
import { createServiceSupabase } from "@/lib/supabase/service";
import { sendInquiry } from "@/lib/contact-server";
import type { ContactValues } from "@/lib/validation";

export async function receiveInquiry(values: ContactValues) {
  const client = createServiceSupabase();
  const { website: _honeypot, ...inquiry } = values;
  void _honeypot;
  const { data, error } = await client
    .from("inquiries")
    .insert(inquiry)
    .select("id")
    .single();
  if (error) throw new Error("The inquiry couldn't be saved.");
  if (
    process.env.RESEND_API_KEY &&
    process.env.CONTACT_FROM_EMAIL &&
    process.env.CONTACT_TO_EMAIL
  ) {
    let notification_status = "sent";
    try {
      await sendInquiry(values);
    } catch {
      notification_status = "failed";
    }
    // Email is supplementary: a provider outage must never lose a saved lead
    // or invite a duplicate submission by reporting a false inquiry failure.
    await client
      .from("inquiries")
      .update({ notification_status })
      .eq("id", data.id);
  }
  return data.id as string;
}
