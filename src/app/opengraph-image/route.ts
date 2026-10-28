import { getPublishedSite } from "@/lib/cms/content";
import { createShareImage } from "@/lib/seo/share-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Explicit route keeps public sharing tags out of /admin and draft previews.
// No request text is rendered: only the validated, published CMS document.
export async function GET() {
  const { document } = await getPublishedSite();
  return createShareImage(document);
}
