import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${request.nextUrl.protocol}//${request.headers.get("host") || request.nextUrl.host}`;
  if (request.headers.get("origin") !== new URL(origin).origin)
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const admin = await getAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 401 },
    );
  if (Number(request.headers.get("content-length") || 0) > 5_500_000)
    return NextResponse.json(
      { error: "Choose an image smaller than 5 MB." },
      { status: 413 },
    );
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 5_242_880 || file.size === 0)
      return NextResponse.json(
        { error: "Choose an image smaller than 5 MB." },
        { status: 400 },
      );
    const buffer = Buffer.from(await file.arrayBuffer());
    // Check file signatures instead of trusting the filename or browser MIME type.
    const type = buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? "png"
      : buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
        ? "jpeg"
        : buffer.toString("ascii", 0, 4) === "RIFF" &&
            buffer.toString("ascii", 8, 12) === "WEBP"
          ? "webp"
          : null;
    if (!type)
      return NextResponse.json(
        { error: "Upload a PNG, JPEG, or WebP image." },
        { status: 400 },
      );
    const path = `projects/${randomUUID()}.${type}`;
    const { error } = await admin.client.storage
      .from("site-media")
      .upload(path, buffer, {
        contentType: `image/${type}`,
        cacheControl: "31536000",
        upsert: false,
      });
    if (error)
      return NextResponse.json(
        { error: "The image couldn't be uploaded. Please try again." },
        { status: 503 },
      );
    const { data } = admin.client.storage.from("site-media").getPublicUrl(path);
    return NextResponse.json(
      { url: data.publicUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The upload couldn't be completed." },
      { status: 400 },
    );
  }
}
