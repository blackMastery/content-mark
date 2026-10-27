import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function getBrandArtwork() {
  const image = await readFile(
    join(process.cwd(), "public/brand/content-mark-logo.png"),
  );
  return `data:image/png;base64,${image.toString("base64")}`;
}
