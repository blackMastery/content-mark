"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Eye,
  Heading2,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import {
  saveBlogPost,
  unpublishBlogPost,
  deleteBlogDraft,
} from "@/app/admin/blog-actions";
import {
  emptyBlog,
  slugify,
  type BlogBlock,
  type BlogDocument,
} from "@/lib/blog/schema";
import type { BlogDraft } from "@/lib/blog/content";

const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((module) => module.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="rich-editor-loading">Loading text editor…</div>
    ),
  },
);

type UploadProps = {
  postId: string;
  kind: "image" | "video";
  value: string;
  onChange: (path: string) => void;
  onBusy: (busy: boolean) => void;
  disabled: boolean;
  label: string;
};
function MediaUpload({
  postId,
  kind,
  value,
  onChange,
  onBusy,
  disabled,
  label,
}: UploadProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    const limit = kind === "image" ? 5_242_880 : 52_428_800;
    if (file.size > limit) {
      setError(
        `Choose ${kind === "image" ? "an image under 5 MB" : "a video under 50 MB"}.`,
      );
      return;
    }
    setBusy(true);
    onBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("postId", postId);
      const response = await fetch("/api/admin/blog-media", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      if (result.kind !== kind) throw new Error(`Choose a ${kind} file.`);
      onChange(result.path);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }
  return (
    <div className="blog-upload">
      <label>
        {label}
        <input
          aria-label={label}
          type="file"
          accept={
            kind === "image"
              ? "image/png,image/jpeg,image/webp"
              : "video/mp4,video/webm"
          }
          disabled={disabled || busy}
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      <small role="status">
        {busy
          ? "Uploading…"
          : value
            ? `Uploaded · ${value.split("/").pop()}`
            : kind === "image"
              ? "PNG, JPEG, WebP · up to 5 MB"
              : "MP4, WebM · up to 50 MB. For larger videos, use YouTube or Vimeo."}
      </small>
      {error ? (
        <p role="alert" className="blog-editor-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
export function BlogEditor({ initial }: { initial: BlogDraft }) {
  const router = useRouter();
  const [postId] = useState(initial.id);
  const [post, setPost] = useState<BlogDocument>(initial.document || emptyBlog);
  const [revision, setRevision] = useState(initial.revision);
  const [publishedRevision, setPublishedRevision] = useState(
    initial.publishedRevision,
  );
  const [saved, setSaved] = useState(JSON.stringify(initial.document));
  const [savedSlug, setSavedSlug] = useState(initial.document.slug);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(0);
  const [confirm, setConfirm] = useState<"unpublish" | "delete" | null>(null);
  const dirty = JSON.stringify(post) !== saved;
  const busy = pending || uploading > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const update = (patch: Partial<BlogDocument>) => {
    setPost((current) => ({ ...current, ...patch }));
    setMessage("");
  };
  const updateBlock = (id: string, patch: Partial<BlogBlock>) =>
    setPost((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === id ? ({ ...block, ...patch } as BlogBlock) : block,
      ),
    }));
  const uploadBusy = (value: boolean) =>
    setUploading((count) => count + (value ? 1 : -1));
  function addBlock(type: BlogBlock["type"]) {
    const id = crypto.randomUUID();
    const block: BlogBlock =
      type === "image"
        ? { id, type, path: "", alt: "", caption: "" }
        : type === "video"
          ? { id, type, source: "embed", url: "", caption: "" }
          : { id, type, text: "" };
    update({ blocks: [...post.blocks, block] });
  }
  function move(index: number, direction: number) {
    const blocks = [...post.blocks];
    [blocks[index], blocks[index + direction]] = [
      blocks[index + direction],
      blocks[index],
    ];
    update({ blocks });
  }
  function save(publish: boolean, preview = false) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const result = await saveBlogPost(
          { id: postId, revision },
          post,
          publish,
        );
        if (result.error || !result.revision) {
          setError(result.error || "The article couldn't be saved.");
          return;
        }
        setRevision(result.revision);
        setSaved(JSON.stringify(post));
        setSavedSlug(post.slug);
        if (publish) setPublishedRevision(result.revision);
        setMessage(
          publish
            ? "Your article is published."
            : "Draft saved. Your changes are private.",
        );
        window.history.replaceState(null, "", `/admin/blog/${postId}`);
        if (preview) router.push(`/admin/blog-preview/${postId}`);
      } catch {
        setError("The article couldn't be saved. Please try again.");
      }
    });
  }
  function confirmAction() {
    const action = confirm;
    setConfirm(null);
    setError("");
    startTransition(async () => {
      try {
        if (action === "delete") {
          const result = await deleteBlogDraft({ id: postId, revision });
          if (result.error) {
            setError(result.error);
            return;
          }
          router.push("/admin/blog");
          return;
        }
        const result = await unpublishBlogPost({ id: postId, revision });
        if (result.error || !result.revision) {
          setError(result.error || "Unpublishing failed.");
          return;
        }
        setRevision(result.revision);
        setPublishedRevision(null);
        setMessage("Article unpublished. Your draft is kept.");
      } catch {
        setError("This action couldn't be completed. Please try again.");
      }
    });
  }
  return (
    <div className="blog-editor">
      <Link
        href="/admin/blog"
        className="blog-editor-back"
        onClick={(event) => {
          if (dirty && !window.confirm("Leave without saving your changes?"))
            event.preventDefault();
        }}
      >
        <ArrowLeft size={14} /> All articles
      </Link>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">
            {publishedRevision === null
              ? "A WORK IN PROGRESS"
              : "YOUR PUBLISHED STORY"}
          </span>
          <h1>{revision ? "Make it your own." : "Start something good."}</h1>
          <p>Words, pictures, and a point of view. All in one place.</p>
        </div>
        <span
          className={`blog-status ${publishedRevision !== null ? "published" : ""}`}
        >
          {publishedRevision === null
            ? "Draft"
            : publishedRevision === revision && !dirty
              ? "Published"
              : "Published · unpublished edits"}
        </span>
      </div>
      <div className="blog-editor-toolbar">
        <span role="status">
          {busy
            ? uploading
              ? "Uploading media…"
              : "Saving…"
            : dirty
              ? "Unsaved changes"
              : revision
                ? "All changes saved"
                : "New article"}
        </span>
        <div>
          <button
            className="admin-secondary"
            disabled={busy}
            onClick={() => save(false, true)}
          >
            <Eye size={15} /> Save & preview
          </button>
          <button
            className="admin-secondary"
            disabled={busy}
            onClick={() => save(false)}
          >
            <Save size={15} /> Save draft
          </button>
          <button
            className="admin-primary"
            disabled={busy}
            onClick={() => save(true)}
          >
            {publishedRevision === null ? "Publish article" : "Publish changes"}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
      {message ? (
        <div className="blog-editor-message" role="status">
          {message}
          {publishedRevision === revision ? (
            <Link href={`/blog/${savedSlug}`} target="_blank">
              View article ↗
            </Link>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <div className="blog-editor-error" role="alert">
          {error}
        </div>
      ) : null}
      <fieldset disabled={busy} className="blog-editor-fields">
        <div className="blog-editor-grid">
          <div>
            <section className="admin-panel blog-editor-panel">
              <span className="admin-eyebrow">01 / THE INTRODUCTION</span>
              <label>
                Article title
                <input
                  value={post.title}
                  maxLength={180}
                  placeholder="An idea worth sharing…"
                  onChange={(event) =>
                    update({
                      title: event.target.value,
                      ...(!post.slug || post.slug === slugify(post.title)
                        ? { slug: slugify(event.target.value) }
                        : {}),
                    })
                  }
                />
              </label>
              <label>
                URL slug
                <div className="blog-slug">
                  <span>/blog/</span>
                  <input
                    value={post.slug}
                    maxLength={120}
                    placeholder="your-article-title"
                    onChange={(event) => update({ slug: event.target.value })}
                  />
                </div>
              </label>
              <small>
                Use lowercase letters, numbers, and hyphens. Changing a
                published URL makes its old link unavailable.
              </small>
              <label>
                Short excerpt
                <textarea
                  value={post.excerpt}
                  maxLength={400}
                  rows={3}
                  placeholder="Give readers a reason to read on."
                  onChange={(event) => update({ excerpt: event.target.value })}
                />
              </label>
            </section>
            <section className="admin-panel blog-editor-panel">
              <div className="blog-section-title">
                <span className="admin-eyebrow">02 / TELL YOUR STORY</span>
                <span>{post.blocks.length} blocks</span>
              </div>
              <p className="blog-editor-hint">
                Build your article in blocks. Move them up or down to shape the
                story.
              </p>
              {post.blocks.map((block, index) => (
                <div className="blog-content-block" key={block.id}>
                  <div className="blog-block-heading">
                    <strong>
                      {String(index + 1).padStart(2, "0")} / {block.type}
                    </strong>
                    <div>
                      <button
                        type="button"
                        className="admin-icon-button"
                        disabled={index === 0}
                        aria-label={`Move block ${index + 1} up`}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button"
                        disabled={index === post.blocks.length - 1}
                        aria-label={`Move block ${index + 1} down`}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button"
                        aria-label={`Remove block ${index + 1}`}
                        onClick={() =>
                          update({
                            blocks: post.blocks.filter(
                              (item) => item.id !== block.id,
                            ),
                          })
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {block.type === "text" ? (
                    <RichTextEditor
                      text={block.text}
                      document={block.richText}
                      disabled={busy}
                      onChange={(text, richText) =>
                        updateBlock(block.id, { text, richText })
                      }
                    />
                  ) : null}
                  {block.type === "heading" ? (
                    <label>
                      Section heading
                      <input
                        value={block.text}
                        maxLength={200}
                        placeholder="A new perspective"
                        onChange={(event) =>
                          updateBlock(block.id, { text: event.target.value })
                        }
                      />
                    </label>
                  ) : null}
                  {block.type === "image" ? (
                    <>
                      <MediaUpload
                        label="Upload article image"
                        postId={postId}
                        kind="image"
                        value={block.path}
                        onChange={(path) => updateBlock(block.id, { path })}
                        onBusy={uploadBusy}
                        disabled={busy}
                      />
                      <label>
                        Image description (alt text)
                        <input
                          value={block.alt}
                          maxLength={300}
                          placeholder="Describe the image for readers who can’t see it."
                          onChange={(event) =>
                            updateBlock(block.id, { alt: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Caption (optional)
                        <input
                          value={block.caption}
                          maxLength={500}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              caption: event.target.value,
                            })
                          }
                        />
                      </label>
                    </>
                  ) : null}
                  {block.type === "video" ? (
                    <>
                      <label>
                        Video source
                        <select
                          value={block.source}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              source: event.target.value as "upload" | "embed",
                              url: "",
                            })
                          }
                        >
                          <option value="embed">YouTube or Vimeo</option>
                          <option value="upload">Upload video file</option>
                        </select>
                      </label>
                      {block.source === "embed" ? (
                        <label>
                          Video link
                          <input
                            type="url"
                            value={block.url}
                            maxLength={1000}
                            placeholder="https://www.youtube.com/watch?v=…"
                            onChange={(event) =>
                              updateBlock(block.id, { url: event.target.value })
                            }
                          />
                        </label>
                      ) : (
                        <MediaUpload
                          label="Upload article video"
                          postId={postId}
                          kind="video"
                          value={block.url}
                          onChange={(url) => updateBlock(block.id, { url })}
                          onBusy={uploadBusy}
                          disabled={busy}
                        />
                      )}
                      <label>
                        Video caption / description
                        <input
                          value={block.caption}
                          maxLength={500}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              caption: event.target.value,
                            })
                          }
                        />
                      </label>
                      <small>
                        For accessibility, add captions to your video and
                        include its key points in the article text.
                      </small>
                    </>
                  ) : null}
                </div>
              ))}
              <div className="blog-add-blocks">
                <button
                  disabled={post.blocks.length >= 100}
                  onClick={() => addBlock("text")}
                >
                  <Type size={17} /> Text
                </button>
                <button
                  disabled={post.blocks.length >= 100}
                  onClick={() => addBlock("heading")}
                >
                  <Heading2 size={17} /> Heading
                </button>
                <button
                  disabled={post.blocks.length >= 100}
                  onClick={() => addBlock("image")}
                >
                  <ImagePlus size={17} /> Image
                </button>
                <button
                  disabled={post.blocks.length >= 100}
                  onClick={() => addBlock("video")}
                >
                  <Video size={17} /> Video
                </button>
              </div>
              {!post.blocks.length ? (
                <p className="blog-editor-hint">
                  <Plus size={14} /> Choose a block to begin your article.
                </p>
              ) : null}
            </section>
          </div>
          <aside>
            <section className="admin-panel blog-editor-panel">
              <span className="admin-eyebrow">THE FIRST IMPRESSION</span>
              <h2>Cover image</h2>
              <p className="blog-editor-hint">
                An optional image for the journal and the top of your article.
              </p>
              <MediaUpload
                label="Upload cover image"
                postId={postId}
                kind="image"
                value={post.cover}
                onChange={(cover) => update({ cover })}
                onBusy={uploadBusy}
                disabled={busy}
              />
              {post.cover ? (
                <>
                  <label>
                    Cover image description
                    <input
                      value={post.coverAlt}
                      maxLength={300}
                      onChange={(event) =>
                        update({ coverAlt: event.target.value })
                      }
                    />
                  </label>
                  <button
                    className="blog-text-button"
                    onClick={() => update({ cover: "", coverAlt: "" })}
                  >
                    Remove cover image
                  </button>
                </>
              ) : null}
            </section>
            <section className="admin-panel blog-editor-panel">
              <span className="admin-eyebrow">YOUR PUBLISHING SPACE</span>
              <h2>Ready when you are.</h2>
              <p className="blog-editor-hint">
                Save a draft to keep it private. Publishing creates the version
                visitors can read. Later draft edits stay private until you
                publish changes.
              </p>
              {revision > 0 ? (
                <button
                  className="blog-text-button"
                  onClick={() =>
                    setConfirm(
                      publishedRevision === null ? "delete" : "unpublish",
                    )
                  }
                >
                  {publishedRevision === null
                    ? "Delete this draft"
                    : "Unpublish article"}
                </button>
              ) : null}
            </section>
          </aside>
        </div>
      </fieldset>
      {confirm ? (
        <div className="blog-confirm" role="alert">
          <strong>
            {confirm === "delete"
              ? "Permanently delete this draft?"
              : "Remove this article from the public blog?"}
          </strong>
          <p>
            {confirm === "delete"
              ? "The article text will be deleted. This cannot be undone."
              : "The saved draft will stay in your workspace."}
          </p>
          <button className="admin-secondary" onClick={() => setConfirm(null)}>
            Cancel
          </button>
          <button
            className="admin-primary"
            disabled={busy}
            onClick={confirmAction}
          >
            {confirm === "delete" ? "Delete draft" : "Unpublish article"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
