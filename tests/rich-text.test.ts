import assert from "node:assert/strict";
import { test } from "node:test";
import {
  richTextSchema,
  richTextSnapshot,
  plainTextDocument,
  richTextPlainText,
  safeTextLink,
} from "../src/lib/blog/rich-text";
import {
  blogDraftSchema,
  emptyBlog,
  publishableBlogSchema,
} from "../src/lib/blog/schema";

test("legacy text converts to paragraphs and line breaks without interpreting HTML", () => {
  const doc = plainTextDocument(
    "First <b>literal</b>\nline\n\nSecond paragraph",
  );
  assert.equal(doc.content?.length, 2);
  assert.ok(richTextPlainText(doc).includes("<b>literal</b>"));
  assert.equal(doc.content?.[0].content?.[1].type, "hardBreak");
});
test("formatted content survives CMS validation and empty formatted articles cannot publish", () => {
  const richText = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Read more",
            marks: [
              { type: "bold" },
              { type: "link", attrs: { href: "https://example.com/resource" } },
            ],
          },
        ],
      },
    ],
  };
  const result = blogDraftSchema.parse({
    ...emptyBlog,
    blocks: [{ id: "one", type: "text", text: "Read more", richText }],
  });
  assert.deepEqual(result.blocks[0], {
    id: "one",
    type: "text",
    text: "Read more",
    richText,
  });
  const base = {
    ...emptyBlog,
    title: "An article",
    slug: "an-article",
    excerpt: "Introduction",
    blocks: [
      {
        id: "one",
        type: "text",
        text: "Misleading fallback",
        richText: { type: "doc", content: [{ type: "paragraph" }] },
      },
    ],
  };
  assert.equal(publishableBlogSchema.safeParse(base).success, false);
});
test("links allow web, mail, phone and site paths while rejecting executable and disguised URLs", () => {
  for (const url of [
    "https://example.com",
    "http://example.com/path",
    "mailto:hello@example.com",
    "tel:+5926000000",
    "/services",
    "#details",
  ])
    assert.equal(safeTextLink(url), true, url);
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,bad",
    "//evil.example",
    "https://user:pass@example.com",
    "java\nscript:alert(1)",
    "/\\evil.example",
    "https://example.com\u0000",
  ])
    assert.equal(safeTextLink(url), false, url);
  const unsafe = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Bad link",
            marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
          },
        ],
      },
    ],
  };
  assert.equal(richTextSchema.safeParse(unsafe).success, false);
});
test("rich text rejects unsupported nodes, invalid nesting and overly deep documents", () => {
  assert.equal(
    richTextSchema.safeParse({
      type: "doc",
      content: [{ type: "script", text: "alert(1)" }],
    }).success,
    false,
  );
  assert.equal(
    richTextSchema.safeParse({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "paragraph" }] }],
    }).success,
    false,
  );
  let nested: unknown = { type: "paragraph" };
  for (let i = 0; i < 30; i++)
    nested = { type: "blockquote", content: [nested] };
  assert.equal(
    richTextSchema.safeParse({ type: "doc", content: [nested] }).success,
    false,
  );
});

test("editor snapshots retain null-prototype link attributes without sharing mutable state", () => {
  const attrs = Object.assign(Object.create(null), { href: "/services" });
  const doc = richTextSchema.parse({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Services", marks: [{ type: "link", attrs }] },
        ],
      },
    ],
  });
  const snapshot = richTextSnapshot(doc);
  const savedAttrs = snapshot.content[0].content![0].marks![0].attrs!;
  assert.equal(Object.getPrototypeOf(savedAttrs), Object.prototype);
  attrs.href = "/contact";
  assert.equal(savedAttrs.href, "/services");
});
