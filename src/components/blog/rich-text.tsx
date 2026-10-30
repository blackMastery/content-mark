import type { ReactNode } from "react";
import {
  safeTextLink,
  type RichTextNode,
  type RichTextDocument,
} from "@/lib/blog/rich-text";
function renderNode(node: RichTextNode, key: number): ReactNode {
  const children = node.content?.map(renderNode);
  if (node.type === "text") {
    let result: ReactNode = node.text;
    for (const mark of node.marks || []) {
      if (mark.type === "bold") result = <strong>{result}</strong>;
      if (mark.type === "italic") result = <em>{result}</em>;
      if (mark.type === "underline") result = <u>{result}</u>;
      if (mark.type === "strike") result = <s>{result}</s>;
      if (mark.type === "code") result = <code>{result}</code>;
      if (
        mark.type === "link" &&
        typeof mark.attrs?.href === "string" &&
        safeTextLink(mark.attrs.href)
      )
        result = (
          <a href={mark.attrs.href} rel="noopener noreferrer">
            {result}
          </a>
        );
    }
    return <span key={key}>{result}</span>;
  }
  switch (node.type) {
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading":
      return node.attrs?.level === 3 ? (
        <h3 key={key}>{children}</h3>
      ) : (
        <h2 key={key}>{children}</h2>
      );
    case "hardBreak":
      return <br key={key} />;
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return (
        <ol
          key={key}
          start={typeof node.attrs?.start === "number" ? node.attrs.start : 1}
        >
          {children}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    default:
      return null;
  }
}
export function RichText({ document }: { document: RichTextDocument }) {
  return (
    <div className="blog-rich-text">{document.content.map(renderNode)}</div>
  );
}
