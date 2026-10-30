import { z } from "zod";
import { richTextSchema, richTextPlainText } from "./rich-text";

const mediaPath = z
  .string()
  .max(200)
  .refine(
    (value) =>
      value === "" ||
      /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.(png|jpeg|webp|mp4|webm)$/.test(value),
    "Use a file uploaded to this blog.",
  );
export function videoEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.replace(/^www\./, "");
    if (host === "vimeo.com" && /^\/[0-9]{6,12}\/?$/.test(url.pathname))
      return `https://player.vimeo.com/video/${url.pathname.split("/")[1]}`;
    if (!["youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host))
      return null;
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : url.pathname === "/watch"
          ? url.searchParams.get("v")
          : url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})\/?$/)?.[1];
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}
const blockId = z.string().min(1).max(80);
const blockSchema = z.discriminatedUnion("type", [
  z.object({
    id: blockId,
    type: z.literal("text"),
    text: z.string().max(20000),
    richText: richTextSchema.optional(),
  }),
  z.object({
    id: blockId,
    type: z.literal("heading"),
    text: z.string().max(200),
  }),
  z.object({
    id: blockId,
    type: z.literal("image"),
    path: mediaPath.refine(
      (path) => !path || /\.(png|jpeg|webp)$/.test(path),
      "Choose an uploaded image.",
    ),
    alt: z.string().max(300),
    caption: z.string().max(500),
  }),
  z
    .object({
      id: blockId,
      type: z.literal("video"),
      source: z.enum(["upload", "embed"]),
      url: z.string().max(1000),
      caption: z.string().max(500),
    })
    .superRefine((block, ctx) => {
      if (
        block.url &&
        !(block.source === "embed"
          ? videoEmbedUrl(block.url)
          : mediaPath.safeParse(block.url).success &&
            /\.(mp4|webm)$/.test(block.url))
      )
        ctx.addIssue({
          code: "custom",
          message: "Upload a video or enter a YouTube / Vimeo link.",
          path: ["url"],
        });
    }),
]);
export const blogDraftSchema = z
  .object({
    title: z.string().max(180),
    slug: z
      .string()
      .max(120)
      .refine(
        (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
        "Use lowercase words separated by hyphens for the URL.",
      ),
    excerpt: z.string().max(400),
    cover: mediaPath.refine(
      (path) => !path || /\.(png|jpeg|webp)$/.test(path),
      "Choose an uploaded image.",
    ),
    coverAlt: z.string().max(300),
    blocks: z.array(blockSchema).max(100),
  })
  .superRefine((post, ctx) => {
    if (JSON.stringify(post).length > 180000)
      ctx.addIssue({
        code: "custom",
        message: "This article is too long. Shorten some text before saving.",
      });
    if (
      new Set(post.blocks.map((block) => block.id)).size !== post.blocks.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Each content block must have a unique ID.",
      });
  });
export const publishableBlogSchema = blogDraftSchema.superRefine(
  (post, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    if (!post.title.trim()) issue("Add an article title before publishing.");
    if (!post.slug) issue("Add a URL slug before publishing.");
    if (!post.excerpt.trim()) issue("Add a short excerpt before publishing.");
    if (post.cover && !post.coverAlt.trim())
      issue("Describe the cover image before publishing.");
    if (!post.blocks.length)
      issue("Add some article content before publishing.");
    for (const block of post.blocks) {
      if (
        (block.type === "text" || block.type === "heading") &&
        !(
          block.type === "text" && block.richText
            ? richTextPlainText(block.richText)
            : block.text
        ).trim()
      )
        issue("Fill in or remove empty text blocks.");
      if (block.type === "image" && (!block.path || !block.alt.trim()))
        issue("Upload each image and add an image description.");
      if (block.type === "video" && !block.url)
        issue("Add a video to each video block.");
    }
  },
);
export type BlogDocument = z.infer<typeof blogDraftSchema>;
export type BlogBlock = BlogDocument["blocks"][number];
export const emptyBlog: BlogDocument = {
  title: "",
  slug: "",
  excerpt: "",
  cover: "",
  coverAlt: "",
  blocks: [],
};
export function blogMediaPaths(post: BlogDocument) {
  return [
    ...new Set(
      [
        post.cover,
        ...post.blocks.flatMap((block) =>
          block.type === "image"
            ? [block.path]
            : block.type === "video" && block.source === "upload"
              ? [block.url]
              : [],
        ),
      ].filter(Boolean),
    ),
  ];
}
export function blogMediaUrl(id: string, path: string, preview = false) {
  return `/api/blog/media/${id}?${new URLSearchParams({ path, ...(preview ? { preview: "1" } : {}) })}`;
}
export function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120)
    .replace(/-$/, "");
}
