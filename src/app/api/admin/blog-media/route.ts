import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/supabase/admin";
export const runtime = "nodejs";
const limit = 52_428_800;
const fail = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });
export async function POST(request: NextRequest) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `${request.nextUrl.protocol}//${request.headers.get("host") || request.nextUrl.host}`;
  if (request.headers.get("origin") !== new URL(origin).origin)
    return fail("Invalid request origin.", 403);
  const admin = await getAdmin();
  if (!admin) return fail("Administrator access required.", 401);
  if (Number(request.headers.get("content-length") || 0) > limit + 100000)
    return fail("Choose a file smaller than 50 MB.", 413);
  try {
    const form = await request.formData();
    const id = z.uuid().safeParse(form.get("postId"));
    const file = form.get("file");
    if (
      !id.success ||
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > limit
    )
      return fail("Choose an image up to 5 MB or video up to 50 MB.");
    const buffer = Buffer.from(await file.arrayBuffer());
    const type = buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? "png"
      : buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
        ? "jpeg"
        : buffer.toString("ascii", 0, 4) === "RIFF" &&
            buffer.toString("ascii", 8, 12) === "WEBP"
          ? "webp"
          : buffer.toString("ascii", 4, 8) === "ftyp" &&
              file.type === "video/mp4"
            ? "mp4"
            : buffer
                  .subarray(0, 4)
                  .equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) &&
                file.type === "video/webm"
              ? "webm"
              : null;
    if (!type) return fail("Use a PNG, JPEG, WebP, MP4, or WebM file.");
    const video = ["mp4", "webm"].includes(type);
    if (!video && file.size > 5_242_880)
      return fail("Choose an image smaller than 5 MB.");
    const path = `${id.data}/${randomUUID()}.${type}`;
    const { error } = await admin.client.storage
      .from("blog-media")
      .upload(path, buffer, {
        contentType: `${video ? "video" : "image"}/${type}`,
        cacheControl: "3600",
        upsert: false,
      });
    if (error)
      return fail("The file couldn't be uploaded. Please try again.", 503);
    return NextResponse.json(
      { path, kind: video ? "video" : "image" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return fail("The upload couldn't be completed. Please try again.");
  }
}
