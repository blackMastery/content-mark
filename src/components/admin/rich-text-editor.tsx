"use client";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Link2,
  Unlink,
  Undo2,
  Redo2,
} from "lucide-react";
import {
  plainTextDocument,
  richTextPlainText,
  richTextSnapshot,
  safeTextLink,
  type RichTextDocument,
} from "@/lib/blog/rich-text";

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    codeBlock: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      defaultProtocol: "https",
      isAllowedUri: safeTextLink,
      HTMLAttributes: { target: null, rel: "noopener noreferrer" },
    },
  }),
];
export function RichTextEditor({
  text,
  document,
  disabled,
  onChange,
}: {
  text: string;
  document?: RichTextDocument;
  disabled: boolean;
  onChange: (text: string, document: RichTextDocument) => void;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkError, setLinkError] = useState("");
  const selection = useRef({ from: 0, to: 0, existing: false });
  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content: document || plainTextDocument(text),
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Paragraph text",
        "aria-multiline": "true",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      const content = richTextSnapshot(editor.getJSON() as RichTextDocument);
      onChange(richTextPlainText(content), content);
    },
  });
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            strike: editor.isActive("strike"),
            code: editor.isActive("code"),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
            blockquote: editor.isActive("blockquote"),
            link: editor.isActive("link"),
            heading: editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
                ? "3"
                : "paragraph",
            undo: editor.can().undo(),
            redo: editor.can().redo(),
          }
        : null,
  });
  function openLink() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    selection.current = { from, to, existing: editor.isActive("link") };
    setHref(editor.getAttributes("link").href || "");
    setLinkText("");
    setLinkError("");
    setLinkOpen(true);
  }
  function applyLink(event: React.FormEvent) {
    event.preventDefault();
    if (!editor) return;
    const url = href.trim();
    if (!safeTextLink(url)) {
      setLinkError(
        "Use a full http(s) URL, email (mailto:), phone (tel:), or a site path such as /services.",
      );
      return;
    }
    const { from, to, existing } = selection.current;
    if (from === to && !existing && !linkText.trim()) {
      setLinkError("Add the text readers should click.");
      return;
    }
    const chain = editor.chain().focus().setTextSelection({ from, to });
    if (from === to && !existing)
      chain
        .insertContent({
          type: "text",
          text: linkText.trim(),
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .run();
    else chain.extendMarkRange("link").setLink({ href: url }).run();
    setLinkOpen(false);
  }
  if (!editor || !state)
    return <div className="rich-editor-loading">Loading text editor…</div>;
  const controls = [
    {
      label: "Bold",
      icon: Bold,
      active: state.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: state.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: Underline,
      active: state.underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      active: state.strike,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: "Inline code",
      icon: Code,
      active: state.code,
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      label: "Bulleted list",
      icon: List,
      active: state.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: state.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: Quote,
      active: state.blockquote,
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];
  return (
    <div className={`rich-editor ${disabled ? "rich-editor-disabled" : ""}`}>
      <span className="rich-editor-label">Paragraph text</span>
      <div
        className="rich-editor-toolbar"
        role="group"
        aria-label="Text formatting"
      >
        <select
          aria-label="Text style"
          value={state.heading}
          disabled={disabled}
          onChange={(event) =>
            event.target.value === "paragraph"
              ? editor.chain().focus().setParagraph().run()
              : editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: Number(event.target.value) as 2 | 3 })
                  .run()
          }
        >
          <option value="paragraph">Paragraph</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
        {controls.map((control) => (
          <button
            key={control.label}
            type="button"
            title={control.label}
            aria-label={control.label}
            aria-pressed={control.active}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={control.run}
          >
            <control.icon size={15} />
          </button>
        ))}
        <button
          type="button"
          title="Add or edit link"
          aria-label="Add or edit link"
          aria-pressed={state.link}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={openLink}
        >
          <Link2 size={15} />
        </button>
        <button
          type="button"
          title="Remove link"
          aria-label="Remove link"
          disabled={disabled || !state.link}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            setLinkOpen(false);
          }}
        >
          <Unlink size={15} />
        </button>
        <button
          type="button"
          title="Undo"
          aria-label="Undo text change"
          disabled={disabled || !state.undo}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          title="Redo"
          aria-label="Redo text change"
          disabled={disabled || !state.redo}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={15} />
        </button>
      </div>
      {linkOpen ? (
        <form className="rich-editor-link" onSubmit={applyLink}>
          <label>
            Link URL
            <input
              autoFocus
              value={href}
              maxLength={2000}
              placeholder="https://example.com or /services"
              onChange={(event) => setHref(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setLinkOpen(false);
                  editor.commands.focus();
                }
              }}
            />
          </label>
          {selection.current.from === selection.current.to &&
          !selection.current.existing ? (
            <label>
              Link text
              <input
                value={linkText}
                maxLength={1000}
                onChange={(event) => setLinkText(event.target.value)}
              />
            </label>
          ) : null}
          {linkError ? <p role="alert">{linkError}</p> : null}
          <div>
            <button type="submit" className="admin-primary" disabled={disabled}>
              Apply link
            </button>
            <button
              type="button"
              className="admin-secondary"
              onClick={() => {
                setLinkOpen(false);
                editor.commands.focus();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      <EditorContent editor={editor} />
      <small className="rich-editor-hint">
        Select text to format it or add a link. Ctrl / ⌘ + B for bold, I for
        italic, U for underline.
      </small>
    </div>
  );
}
