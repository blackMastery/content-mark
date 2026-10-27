import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Inquiry } from "@/lib/cms/schema";
import { InquiryDetail } from "@/components/admin/inquiry-detail";
export default async function InquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { client } = await requireAdmin();
  const { data, error } = await client
    .from("inquiries")
    .select(
      "id,name,business,email,phone,service,budget,description,status,notes,created_at,updated_at,notification_status",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("The inquiry couldn't be loaded.");
  if (!data) notFound();
  return <InquiryDetail inquiry={data as Inquiry} />;
}
