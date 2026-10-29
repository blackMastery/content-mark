import Link from "next/link";
import { ArrowUpRight, BookOpen, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/admin";
import { readBlogDraft } from "@/lib/blog/content";
import { articleDate } from "@/components/blog/article";
export default async function BlogAdminPage() {
  const { client } = await requireAdmin();
  const { data, error } = await client
    .from("blog_posts")
    .select("id,document,revision,published_revision,updated_at")
    .order("updated_at", { ascending: false });
  if (error)
    throw new Error(
      "The blog couldn't be loaded. Check that its migration has been applied.",
    );
  const posts = data.map(readBlogDraft);
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">THE CONTENT MARK JOURNAL</span>
          <h1>
            A space for
            <br />
            <em>your next good idea.</em>
          </h1>
          <p>Write at your own pace. Publish when you’re ready.</p>
        </div>
        <Link href="/admin/blog/new" className="admin-primary">
          New article <Plus size={16} />
        </Link>
      </div>
      <div className="blog-admin-summary">
        <span>
          <strong>{posts.length}</strong> articles
        </span>
        <span>
          <strong>
            {posts.filter((post) => post.publishedRevision !== null).length}
          </strong>{" "}
          published
        </span>
        <Link href="/blog" target="_blank">
          View the journal <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="admin-panel blog-admin-list">
        {posts.length ? (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/blog/${post.id}`}
              className="blog-admin-row"
            >
              <span className="blog-admin-icon">
                <BookOpen size={20} />
              </span>
              <div>
                <span
                  className={`blog-status ${post.publishedRevision !== null ? "published" : ""}`}
                >
                  {post.publishedRevision === null
                    ? "Draft"
                    : post.publishedRevision !== post.revision
                      ? "Published · unpublished edits"
                      : "Published"}
                </span>
                <h2>{post.document.title || "Untitled article"}</h2>
                <p>
                  Updated {articleDate(post.updatedAt)}
                  {post.document.slug ? ` · /blog/${post.document.slug}` : ""}
                </p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))
        ) : (
          <div className="admin-empty">
            <BookOpen size={34} strokeWidth={1} />
            <h2>Your first story starts here.</h2>
            <p>
              Add words, images, and video. Your drafts stay private until you
              publish.
            </p>
            <Link className="admin-primary" href="/admin/blog/new">
              Write an article <Plus size={15} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
