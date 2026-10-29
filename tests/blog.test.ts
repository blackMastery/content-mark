import assert from "node:assert/strict";
import { test } from "node:test";
import {
  blogDraftSchema,
  publishableBlogSchema,
  videoEmbedUrl,
  blogMediaPaths,
} from "../src/lib/blog/schema";

const draft = {
  title: "A useful article",
  slug: "a-useful-article",
  excerpt: "A short introduction.",
  cover: "",
  coverAlt: "",
  blocks: [
    { id: "one", type: "text", text: "Hello <script>alert(1)</script>" },
  ],
};
test("incomplete articles can be saved, but publication requires a title, slug and content", () => {
  assert.ok(
    blogDraftSchema.safeParse({ ...draft, title: "", slug: "", blocks: [] })
      .success,
  );
  assert.ok(
    !publishableBlogSchema.safeParse({ ...draft, title: "", blocks: [] })
      .success,
  );
  assert.ok(
    !publishableBlogSchema.safeParse({ ...draft, slug: "../admin" }).success,
  );
  assert.ok(publishableBlogSchema.safeParse(draft).success);
});
test("media references are restricted to uploaded files and approved video providers", () => {
  assert.ok(
    !blogDraftSchema.safeParse({ ...draft, cover: "javascript:alert(1)" })
      .success,
  );
  assert.ok(
    !blogDraftSchema.safeParse({ ...draft, cover: "../private.png" }).success,
  );
  assert.ok(
    !blogDraftSchema.safeParse({
      ...draft,
      blocks: [
        {
          id: "v",
          type: "video",
          source: "embed",
          url: "https://evil.example/watch",
          caption: "",
        },
      ],
    }).success,
  );
  assert.equal(
    videoEmbedUrl("https://youtu.be/dQw4w9WgXcQ"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
  assert.equal(
    videoEmbedUrl("https://vimeo.com/123456789"),
    "https://player.vimeo.com/video/123456789",
  );
  assert.equal(
    videoEmbedUrl("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ"),
    null,
  );
});
test("publishing requires image descriptions and complete media blocks", () => {
  assert.ok(
    !publishableBlogSchema.safeParse({ ...draft, cover: "abc/file.png" })
      .success,
  );
  assert.ok(
    !publishableBlogSchema.safeParse({
      ...draft,
      blocks: [{ id: "i", type: "image", path: "", alt: "", caption: "" }],
    }).success,
  );
  const post = blogDraftSchema.parse({
    ...draft,
    cover: "abc/cover.png",
    blocks: [
      {
        id: "i",
        type: "image",
        path: "abc/photo.webp",
        alt: "A photograph",
        caption: "",
      },
    ],
  });
  assert.deepEqual(blogMediaPaths(post), ["abc/cover.png", "abc/photo.webp"]);
});
