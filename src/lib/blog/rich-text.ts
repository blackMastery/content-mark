import { z } from "zod";

export type RichTextMark = {
  type: "bold" | "italic" | "underline" | "strike" | "code" | "link";
  attrs?: Record<string, unknown>;
};
export type RichTextNode = {
  type:
    | "doc"
    | "paragraph"
    | "heading"
    | "blockquote"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "hardBreak"
    | "text";
  content?: RichTextNode[];
  text?: string;
  marks?: RichTextMark[];
  attrs?: Record<string, unknown>;
};
export type RichTextDocument = RichTextNode & {
  type: "doc";
  content: RichTextNode[];
};

export function safeTextLink(href: string) {
  if (!href || href.length > 2000 || /[\s\u0000-\u001f\u007f\\]/.test(href))
    return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  if (/^#[a-zA-Z][\w-]*$/.test(href)) return true;
  try {
    const url = new URL(href);
    if (url.username || url.password) return false;
    if (["https:", "http:"].includes(url.protocol))
      return Boolean(url.hostname);
    if (url.protocol === "mailto:")
      return /^[^@?]+@[^@?]+\.[^@?]+(?:\?[^\s]*)?$/.test(
        url.pathname + url.search,
      );
    return url.protocol === "tel:" && /^\+?[0-9().-]{5,30}$/.test(url.pathname);
  } catch {
    return false;
  }
}
const blocks = [
  "paragraph",
  "heading",
  "blockquote",
  "bulletList",
  "orderedList",
];
const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
function validDocument(input: unknown): input is RichTextDocument {
  if (!record(input) || input.type !== "doc" || !Array.isArray(input.content))
    return false;
  const pending = [{ node: input, parent: "root", depth: 0 }];
  let count = 0,
    characters = 0;
  while (pending.length) {
    const { node, parent, depth } = pending.pop()!;
    if (
      ++count > 3000 ||
      depth > 16 ||
      !record(node) ||
      typeof node.type !== "string"
    )
      return false;
    const type = node.type;
    const allowed =
      parent === "root"
        ? ["doc"]
        : ["paragraph", "heading"].includes(parent)
          ? ["text", "hardBreak"]
          : ["bulletList", "orderedList"].includes(parent)
            ? ["listItem"]
            : blocks;
    if (!allowed.includes(type)) return false;
    if (node.attrs !== undefined && !record(node.attrs)) return false;
    const attrs = node.attrs as Record<string, unknown> | undefined;
    if (type === "heading" && ![2, 3].includes(attrs?.level as number))
      return false;
    if (
      type === "orderedList" &&
      attrs?.start !== undefined &&
      (!Number.isInteger(attrs.start) ||
        Number(attrs.start) < 1 ||
        Number(attrs.start) > 100000)
    )
      return false;
    if (type === "text") {
      if (typeof node.text !== "string" || !node.text.length) return false;
      characters += node.text.length;
      if (characters > 20000 || node.content !== undefined) return false;
      if (node.marks !== undefined) {
        if (!Array.isArray(node.marks) || node.marks.length > 6) return false;
        if (
          new Set(node.marks.map((mark) => (record(mark) ? mark.type : null)))
            .size !== node.marks.length
        )
          return false;
        for (const mark of node.marks) {
          if (
            !record(mark) ||
            !["bold", "italic", "underline", "strike", "code", "link"].includes(
              String(mark.type),
            )
          )
            return false;
          if (
            mark.type === "link" &&
            (!record(mark.attrs) ||
              typeof mark.attrs.href !== "string" ||
              !safeTextLink(mark.attrs.href))
          )
            return false;
        }
      }
      continue;
    }
    if (node.marks !== undefined || node.text !== undefined) return false;
    if (type === "hardBreak") {
      if (node.content !== undefined) return false;
      continue;
    }
    if (node.content !== undefined && !Array.isArray(node.content))
      return false;
    const content = (node.content || []) as unknown[];
    if (
      ["bulletList", "orderedList", "blockquote", "listItem"].includes(type) &&
      !content.length
    )
      return false;
    if (
      type === "listItem" &&
      (!record(content[0]) || content[0].type !== "paragraph")
    )
      return false;
    for (const child of content)
      pending.push({
        node: child as Record<string, unknown>,
        parent: type,
        depth: depth + 1,
      });
  }
  return true;
}
export const richTextSchema = z.custom<RichTextDocument>(
  validDocument,
  "Use supported formatting and safe links. Keep text blocks under 20,000 characters and avoid deeply nested lists.",
);
export function plainTextDocument(text: string): RichTextDocument {
  return {
    type: "doc",
    content: text.split(/\n\s*\n/).map((paragraph) => ({
      type: "paragraph",
      ...(paragraph
        ? {
            content: paragraph
              .split("\n")
              .flatMap((line, index): RichTextNode[] => [
                ...(index ? [{ type: "hardBreak" as const }] : []),
                ...(line ? [{ type: "text" as const, text: line }] : []),
              ]),
          }
        : {}),
    })),
  };
}
export function richTextPlainText(node: RichTextNode): string {
  if (node.type === "text") return node.text || "";
  if (node.type === "hardBreak") return "\n";
  return (node.content || [])
    .map(richTextPlainText)
    .join(["paragraph", "heading"].includes(node.type) ? "" : "\n");
}

// ProseMirror attributes may have null prototypes. Server Actions need a plain,
// detached JSON snapshot so link and heading attributes survive transport.
export function richTextSnapshot(document: RichTextDocument): RichTextDocument {
  return JSON.parse(JSON.stringify(document)) as RichTextDocument;
}
