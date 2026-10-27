import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  createFormToken,
  sendInquiry,
  validateFormToken,
} from "@/lib/contact-server";
import { createContactSchema } from "@/lib/validation";
import { getSiteDocument } from "@/lib/cms/content";
import { getServiceOptions } from "@/lib/cms/options";
import { receiveInquiry } from "@/lib/cms/inquiries";
import { supabaseConfigured } from "@/lib/supabase/config";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const error = (message: string, status: number) =>
  NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export function GET() {
  return NextResponse.json(
    { token: createFormToken() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: NextRequest) {
  const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
    : `${request.nextUrl.protocol}//${request.headers.get("host") || request.nextUrl.host}`;
  if (request.headers.get("origin") !== expectedOrigin)
    return error("This submission origin isn't allowed.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return error("Please send a valid inquiry.", 415);
  if (Number(request.headers.get("content-length") || 0) > 16_384)
    return error("Your inquiry is too large.", 413);
  try {
    const allowed = await checkRateLimit(
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "local",
    );
    if (!allowed)
      return error(
        "Too many inquiries. Please wait 10 minutes before trying again.",
        429,
      );
    const reader = request.body?.getReader();
    if (!reader) return error("Please send a valid inquiry.", 400);
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 16_384) {
        await reader.cancel();
        return error("Your inquiry is too large.", 413);
      }
      chunks.push(value);
    }
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return error("Please send a valid inquiry.", 400);
    }
    const site = await getSiteDocument();
    const parsed = createContactSchema(getServiceOptions(site)).safeParse(body);
    if (!parsed.success)
      return error(
        "Please check your details and complete all required fields.",
        400,
      );
    const databaseReady =
      supabaseConfigured() && Boolean(process.env.SUPABASE_SECRET_KEY);
    const emailReady = Boolean(
      process.env.RESEND_API_KEY &&
      process.env.CONTACT_FROM_EMAIL &&
      process.env.CONTACT_TO_EMAIL,
    );
    if (
      (!databaseReady && !emailReady) ||
      (process.env.NODE_ENV === "production" &&
        !process.env.CONTACT_FORM_SECRET)
    )
      return error(
        "Inquiry delivery is not configured yet. Your message has not been sent. Please contact Content Mark through the Facebook link on this page.",
        503,
      );
    if (typeof body.token !== "string" || !validateFormToken(body.token))
      return error(
        "Please refresh this page, take a moment to complete the form, and try again.",
        400,
      );
    if (databaseReady) await receiveInquiry(parsed.data);
    else await sendInquiry(parsed.data);
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return error(
      "We couldn't send your inquiry right now. Your message has not been sent. Please try again or contact us on Facebook.",
      503,
    );
  }
}
