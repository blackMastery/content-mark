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

test("formatted articles render semantic text and links without injecting HTML", () => {
  const richPost: BlogDocument = {
    ...post,
    cover: "",
    blocks: [
      {
        id: "rich",
        type: "text",
        text: "Fallback should not duplicate content",
        richText: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "A useful section" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "<img src=x onerror=alert(1)>",
                  marks: [
                    { type: "bold" },
                    { type: "italic" },
                    { type: "underline" },
                  ],
                },
                {
                  type: "text",
                  text: " Our services",
                  marks: [{ type: "link", attrs: { href: "/services" } }],
                },
              ],
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "One clear point" }],
                    },
                  ],
                },
              ],
            },
            {
              type: "orderedList",
              attrs: { start: 3 },
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Third step" }],
                    },
                  ],
                },
              ],
            },
            {
              type: "blockquote",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "An idea to remember" }],
                },
              ],
            },
          ],
        },
      },
    ],
  };
  const html = renderToStaticMarkup(
    <BlogArticle id="abc" document={richPost} />,
  );
  assert.match(
    html,
    /<h2>A useful section<\/h2>|<h2><span>A useful section<\/span><\/h2>/,
  );
  assert.match(html, /<strong>&lt;img/);
  assert.ok(!html.includes("<img src=x"));
  assert.match(
    html,
    /<a href="\/services" rel="noopener noreferrer"> Our services<\/a>/,
  );
  assert.match(html, /<ul><li>/);
  assert.match(html, /<ol start="3"><li>/);
  assert.match(html, /<blockquote>/);
  assert.ok(!html.includes("Fallback should not duplicate content"));
});
