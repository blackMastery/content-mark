/* eslint-disable @next/next/no-img-element -- Private blog media is authorized per request. */
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import {
  blogMediaUrl,
  videoEmbedUrl,
  type BlogDocument,
} from "@/lib/blog/schema";
import type { PublishedArticle } from "@/lib/blog/content";
export const articleDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Guyana",
  }).format(new Date(date));

export function BlogIndex({ articles }: { articles: PublishedArticle[] }) {
  return (
    <section className="section blog-index">
      <div className="container">
        <div className="blog-heading">
          <span className="eyebrow">
            <i /> THE CONTENT MARK JOURNAL
          </span>
          <h1>
            Good ideas.
            <br />
            <em>A lasting mark.</em>
          </h1>
          <p>
            Notes on better websites, smarter marketing, and building a business
            that gets noticed.
          </p>
        </div>
        {articles.length ? (
          <div className="blog-grid">
            {articles.map((post, index) => (
              <article
                className={`blog-card ${index === 0 ? "blog-card-featured" : ""}`}
                key={post.id}
              >
                <Link href={`/blog/${post.slug}`} className="blog-card-link">
                  <div className="blog-card-image">
                    {post.document.cover ? (
                      <img
                        src={blogMediaUrl(post.id, post.document.cover)}
                        alt={post.document.coverAlt}
                        loading={index ? "lazy" : "eager"}
                      />
                    ) : (
                      <div className="blog-cover-placeholder">
                        <BookOpen size={42} strokeWidth={1} />
                        <span>IDEAS THAT MOVE YOU FORWARD.</span>
                      </div>
                    )}
                    <span className="blog-card-arrow">
                      <ArrowUpRight size={24} />
                    </span>
                  </div>
                  <div className="blog-card-copy">
                    <span className="blog-meta">
                      {index === 0 ? "LATEST ARTICLE · " : ""}
                      <time dateTime={post.publishedAt}>
                        {articleDate(post.publishedAt)}
                      </time>
                    </span>
                    <h2>{post.document.title}</h2>
                    <p>{post.document.excerpt}</p>
                    <span className="blog-read">
                      Read the story <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <BookOpen size={36} strokeWidth={1} />
            <h2>Our next chapter is on its way.</h2>
            <p>
              We’re putting our first ideas into words. Check back soon for
              insights on websites, advertising, and growing online.
            </p>
            <Link className="button button-outline" href="/services">
              Explore our services <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
export function BlogArticle({
  id,
  document: post,
  publishedAt,
  preview = false,
}: {
  id: string;
  document: BlogDocument;
  publishedAt?: string;
  preview?: boolean;
}) {
  return (
    <article className="blog-article">
      <header className="container blog-article-header">
        <Link
          href={preview ? `/admin/blog/${id}` : "/blog"}
          className="blog-back"
        >
          ← {preview ? "Back to editor" : "All articles"}
        </Link>
        <span className="eyebrow">
          {preview ? "PRIVATE DRAFT PREVIEW" : "THE CONTENT MARK JOURNAL"}
        </span>
        <h1>{post.title || "Untitled article"}</h1>
        <p className="blog-deck">{post.excerpt}</p>
        <div className="blog-meta">
          BY CONTENT MARK
          {publishedAt ? (
            <>
              {" "}
              · <time dateTime={publishedAt}>{articleDate(publishedAt)}</time>
            </>
          ) : (
            " · DRAFT"
          )}
        </div>
      </header>
      {post.cover ? (
        <figure className="container blog-article-cover">
          <img
            src={blogMediaUrl(id, post.cover, preview)}
            alt={post.coverAlt}
          />
        </figure>
      ) : null}
      <div className="blog-body">
        {post.blocks.map((block) => {
          if (block.type === "heading")
            return <h2 key={block.id}>{block.text}</h2>;
          if (block.type === "text")
            return (
              <div className="blog-paragraphs" key={block.id}>
                {block.text.split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            );
          if (block.type === "image")
            return block.path ? (
              <figure key={block.id}>
                <img
                  src={blogMediaUrl(id, block.path, preview)}
                  alt={block.alt}
                  loading="lazy"
                />
                {block.caption ? (
                  <figcaption>{block.caption}</figcaption>
                ) : null}
              </figure>
            ) : null;
          if (!block.url) return null;
          const embed =
            block.source === "embed" ? videoEmbedUrl(block.url) : null;
          return (
            <figure key={block.id}>
              {embed ? (
                <iframe
                  className="blog-video"
                  src={embed}
                  title={block.caption || "Article video"}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : block.source === "upload" ? (
                <video
                  className="blog-video"
                  src={blogMediaUrl(id, block.url, preview)}
                  controls
                  preload="metadata"
                  playsInline
                />
              ) : null}
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>
    </article>
  );
}
