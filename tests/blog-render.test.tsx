import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogArticle } from "../src/components/blog/article";
import { emptyBlog, type BlogDocument } from "../src/lib/blog/schema";
const post: BlogDocument = {
  ...emptyBlog,
  title: "A clear headline",
  slug: "a-clear-headline",
  excerpt: "A practical introduction.",
  cover: "abc/cover.png",
  coverAlt: "A bright cover",
  blocks: [
    {
      id: "one",
      type: "text",
      text: "<script>alert('test')</script>\n\nA second paragraph.",
    },
    { id: "two", type: "heading", text: "The next chapter" },
    {
      id: "three",
      type: "image",
      path: "abc/photo.webp",
      alt: "A photograph",
      caption: "The photo caption",
    },
    {
      id: "four",
      type: "video",
      source: "upload",
      url: "abc/clip.mp4",
      caption: "The video caption",
    },
    {
      id: "five",
      type: "video",
      source: "embed",
      url: "https://youtu.be/dQw4w9WgXcQ",
      caption: "Embedded video",
    },
  ],
};
test("article rendering escapes text and renders accessible images, headings, and videos", () => {
  const html = renderToStaticMarkup(
    <BlogArticle id="abc" document={post} publishedAt="2026-10-29T12:00:00Z" />,
  );
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes('alt="A photograph"'));
  assert.ok(html.includes("The photo caption"));
  assert.match(html, /<video[^>]*controls=""[^>]*preload="metadata"/);
  assert.match(html, /youtube-nocookie.com\/embed\/dQw4w9WgXcQ/);
  assert.ok(!html.includes("preview=1"));
});
test("private previews mark every uploaded asset as an authenticated draft request", () => {
  const html = renderToStaticMarkup(
    <BlogArticle id="abc" document={post} preview />,
  );
  assert.ok(html.includes("PRIVATE DRAFT PREVIEW"));
  assert.equal((html.match(/src="[^"]*preview=1"/g) || []).length, 3);
  assert.ok(html.includes("/admin/blog/abc"));
});
