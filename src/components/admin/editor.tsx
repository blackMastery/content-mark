"use client";
import { useEffect, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  CloudUpload,
  Eye,
  Globe2,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { saveSiteDocument } from "@/app/admin/actions";
import { sectionKeys, type SiteDocument } from "@/lib/cms/schema";

export type EditorMode =
  "content" | "projects" | "pricing" | "faqs" | "settings";
type Path = (string | number)[];
function Field({
  label,
  value,
  onChange,
  multiline = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <label className={`admin-field ${multiline ? "wide" : ""}`}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          rows={
            value.includes("\n") ? Math.min(value.split("\n").length + 1, 8) : 3
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}{" "}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
const titles: Record<EditorMode, { title: string; description: string }> = {
  content: {
    title: "Words that make your mark.",
    description:
      "Shape the story your website tells. Save a private draft, then publish when you're ready.",
  },
  projects: {
    title: "Make your work stand out.",
    description:
      "Manage project cards, upload images, and keep concepts clearly labeled.",
  },
  pricing: {
    title: "A clear path to working together.",
    description:
      "Keep your packages, deliverables, and launch offer up to date.",
  },
  faqs: {
    title: "Good questions. Clear answers.",
    description:
      "Help visitors make a confident next step with useful, honest answers.",
  },
  settings: {
    title: "The details that connect it all.",
    description:
      "Manage search metadata, social links, contact channels, and footer details.",
  },
};
export function ContentEditor({
  initial,
  revision: initialRevision,
  publishedRevision,
  updatedAt,
  mode,
}: {
  initial: SiteDocument;
  revision: number;
  publishedRevision: number;
  updatedAt: string;
  mode: EditorMode;
}) {
  const [document, setDocument] = useState(initial);
  const [revision, setRevision] = useState(initialRevision);
  const [published, setPublished] = useState(publishedRevision);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{
    error?: boolean;
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<number | null>(null);
  const [section, setSection] = useState("hero");
  const [savedAt, setSavedAt] = useState(updatedAt);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const guard = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (
        anchor &&
        anchor.target !== "_blank" &&
        anchor.getAttribute("href")?.startsWith("/admin") &&
        !window.confirm(
          "You have unsaved changes. Leave this editor without saving?",
        )
      )
        e.preventDefault();
    };
    window.addEventListener("beforeunload", prevent);
    window.document.body.addEventListener("click", guard, true);
    return () => {
      window.removeEventListener("beforeunload", prevent);
      window.document.body.removeEventListener("click", guard, true);
    };
  }, [dirty]);
  function edit(path: Path, value: unknown) {
    setDocument((current) => {
      const copy = structuredClone(current);
      let target: Record<string | number, unknown> = copy as unknown as Record<
        string | number,
        unknown
      >;
      for (const key of path.slice(0, -1))
        target = target[key] as Record<string | number, unknown>;
      target[path[path.length - 1]] = value;
      return copy;
    });
    setDirty(true);
    setMessage(null);
  }
  function field(
    label: string,
    path: Path,
    value: string,
    multiline = false,
    hint?: string,
  ) {
    return (
      <Field
        key={path.join(".")}
        label={label}
        value={value}
        multiline={multiline}
        hint={hint}
        onChange={(value) => edit(path, value)}
      />
    );
  }
  function list(
    label: string,
    path: Path,
    value: string[],
    hint = "One item per line.",
  ) {
    return (
      <Field
        label={label}
        value={value.join("\n")}
        multiline
        hint={hint}
        onChange={(value) => edit(path, value.split("\n"))}
      />
    );
  }
  function move(
    collection: "projects" | "faqs",
    index: number,
    direction: number,
  ) {
    const items = [...document[collection]];
    [items[index], items[index + direction]] = [
      items[index + direction],
      items[index],
    ];
    edit([collection], items);
  }
  function controls(collection: "projects" | "faqs", index: number) {
    return (
      <div className="item-controls">
        <button
          type="button"
          className="admin-icon-button"
          disabled={index === 0}
          aria-label={`Move ${collection} item ${index + 1} up`}
          onClick={() => move(collection, index, -1)}
        >
          <ArrowUp size={15} />
        </button>
        <button
          type="button"
          className="admin-icon-button"
          disabled={index === document[collection].length - 1}
          aria-label={`Move ${collection} item ${index + 1} down`}
          onClick={() => move(collection, index, 1)}
        >
          <ArrowDown size={15} />
        </button>
        <button
          type="button"
          className="admin-icon-button danger"
          disabled={document[collection].length === 1}
          aria-label={`Remove ${collection} item ${index + 1}`}
          onClick={() =>
            edit(
              [collection],
              document[collection].filter((_, i) => i !== index),
            )
          }
        >
          <Trash2 size={15} />
        </button>
      </div>
    );
  }
  function save(publish: boolean) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await saveSiteDocument(document, revision, publish);
        if (result.error) {
          setMessage({ error: true, text: result.error });
          return;
        }
        setRevision(result.revision!);
        if (publish) setPublished(result.revision!);
        setSavedAt(result.savedAt!);
        setDirty(false);
        setMessage({
          text: publish
            ? "Your changes are published. The live website is up to date."
            : "Draft saved. Your live website hasn't changed.",
        });
      } catch {
        setMessage({
          error: true,
          text: "We couldn't save your changes. Your edits are still here; please try again.",
        });
      }
    });
  }
  async function upload(index: number, file: File | undefined) {
    if (!file) return;
    if (file.size > 5242880) {
      setMessage({ error: true, text: "Choose an image smaller than 5 MB." });
      return;
    }
    setUploading(index);
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      edit(["projects", index, "imageUrl"], result.url);
      setMessage({
        text: "Image uploaded. Save or publish to use it on the website.",
      });
    } catch (error) {
      setMessage({
        error: true,
        text:
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again.",
      });
    } finally {
      setUploading(null);
    }
  }
  const copy = titles[mode];
  return (
    <div className="admin-editor">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">
            YOUR WEBSITE / {mode.toUpperCase()}
          </span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <span
          className={`admin-status ${dirty || revision !== published ? "draft" : ""}`}
        >
          <i />
          {dirty
            ? "Unsaved changes"
            : revision !== published
              ? "Unpublished draft"
              : "Published"}
        </span>
      </div>
      <div className="editor-toolbar">
        <div>
          <span className="toolbar-dot" />
          <span>
            {dirty
              ? "Your changes are only in this editor."
              : `Saved ${new Date(savedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Guyana" })}`}
          </span>
        </div>
        <div>
          <a
            href="/admin/preview"
            target="_blank"
            className={`admin-secondary ${dirty ? "is-disabled" : ""}`}
            aria-disabled={dirty}
            onClick={(e) => {
              if (dirty) e.preventDefault();
            }}
            title={
              dirty
                ? "Save your draft to preview it"
                : "Preview the saved draft"
            }
          >
            <Eye size={15} />
            Preview draft
          </a>
          <button
            type="button"
            className="admin-secondary"
            disabled={pending || uploading !== null || !dirty}
            onClick={() => save(false)}
          >
            {pending ? (
              <LoaderCircle className="spinner" size={15} />
            ) : (
              <Save size={15} />
            )}
            Save draft
          </button>
          <button
            type="button"
            className="admin-primary"
            disabled={
              pending ||
              uploading !== null ||
              (!dirty && revision === published)
            }
            onClick={() => save(true)}
          >
            <Globe2 size={15} />
            Publish changes
          </button>
        </div>
      </div>
      {message ? (
        <div
          className={`admin-notice ${message.error ? "error" : "success"}`}
          role={message.error ? "alert" : "status"}
        >
          {!message.error ? <Check size={17} /> : null}
          {message.text}
        </div>
      ) : null}
      <fieldset className="editor-fields" disabled={pending}>
        {mode === "content" ? (
          <>
            <div className="editor-section-tabs" aria-label="Content sections">
              {[
                "hero",
                ...sectionKeys,
                "services list",
                "advantages",
                "process steps",
              ].map((key) => (
                <button
                  type="button"
                  key={key}
                  className={section === key ? "active" : ""}
                  onClick={() => setSection(key)}
                >
                  {key.replace(/^./, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>
            {section === "hero" ? (
              <div className="editor-panel">
                <div className="editor-panel-heading">
                  <span>01 / FIRST IMPRESSIONS</span>
                  <h2>Your hero section</h2>
                  <p>
                    Keep headline lines short to preserve the oversized
                    editorial layout.
                  </p>
                </div>
                <div className="editor-form-grid">
                  {field("Eyebrow", ["hero", "eyebrow"], document.hero.eyebrow)}
                  {field(
                    "Location line",
                    ["hero", "location"],
                    document.hero.location,
                  )}
                  {document.hero.headline.map((line, i) =>
                    field(
                      `Headline line ${i + 1}`,
                      ["hero", "headline", i],
                      line,
                    ),
                  )}
                  {field(
                    "Supporting message",
                    ["hero", "description"],
                    document.hero.description,
                    true,
                  )}
                  {field(
                    "Primary button",
                    ["hero", "primaryCta"],
                    document.hero.primaryCta,
                  )}
                  {field(
                    "Secondary button",
                    ["hero", "secondaryCta"],
                    document.hero.secondaryCta,
                  )}
                  {list(
                    "Trust details",
                    ["hero", "assurances"],
                    document.hero.assurances,
                    "Exactly three short details, one per line.",
                  )}
                </div>
              </div>
            ) : null}
            {sectionKeys.some((key) => key === section) ? (
              <div className="editor-panel">
                <div className="editor-panel-heading">
                  <span>SECTION INTRODUCTION</span>
                  <h2>{section.replace(/^./, (c) => c.toUpperCase())}</h2>
                </div>
                <div className="editor-form-grid">
                  {Object.entries(
                    document.headings[section as (typeof sectionKeys)[number]],
                  ).map(([key, value]) =>
                    field(
                      key === "accent"
                        ? "Highlighted heading"
                        : key.replace(/^./, (c) => c.toUpperCase()),
                      ["headings", section, key],
                      value,
                      key === "description" ||
                        key === "title" ||
                        key === "accent",
                    ),
                  )}
                </div>
              </div>
            ) : null}
            {section === "services list"
              ? document.services.map((service, i) => (
                  <div className="editor-panel" key={service.type}>
                    <div className="editor-panel-heading">
                      <span>SERVICE 0{i + 1}</span>
                      <h2>{service.title}</h2>
                    </div>
                    <div className="editor-form-grid">
                      {field(
                        "Service title",
                        ["services", i, "title"],
                        service.title,
                      )}
                      {field(
                        "Headline",
                        ["services", i, "headline"],
                        service.headline,
                        true,
                      )}
                      {field(
                        "Description",
                        ["services", i, "description"],
                        service.description,
                        true,
                      )}
                      {list(
                        "Included services",
                        ["services", i, "features"],
                        service.features,
                      )}
                    </div>
                  </div>
                ))
              : null}
            {section === "advantages"
              ? document.advantages.map((item, i) => (
                  <div className="editor-panel" key={i}>
                    <span className="admin-eyebrow">ADVANTAGE 0{i + 1}</span>
                    <div className="editor-form-grid">
                      {field("Title", ["advantages", i, "title"], item.title)}
                      {field(
                        "Description",
                        ["advantages", i, "description"],
                        item.description,
                        true,
                      )}
                    </div>
                  </div>
                ))
              : null}
            {section === "process steps"
              ? document.steps.map((item, i) => (
                  <div className="editor-panel" key={i}>
                    <span className="admin-eyebrow">STEP 0{i + 1}</span>
                    <div className="editor-form-grid">
                      {field("Step name", ["steps", i, "title"], item.title)}
                      {field(
                        "Short description",
                        ["steps", i, "description"],
                        item.description,
                        true,
                      )}
                      {field(
                        "Detailed explanation",
                        ["steps", i, "detail"],
                        item.detail,
                        true,
                      )}
                      {list(
                        "Step highlights",
                        ["steps", i, "tags"],
                        item.tags,
                        "Exactly three highlights, one per line.",
                      )}
                    </div>
                  </div>
                ))
              : null}
          </>
        ) : null}
        {mode === "projects" ? (
          <>
            {document.projects.map((project, i) => (
              <div className="editor-panel" key={project.id}>
                <div className="editor-panel-heading with-controls">
                  <div>
                    <span>PROJECT 0{i + 1}</span>
                    <h2>{project.name}</h2>
                  </div>
                  {controls("projects", i)}
                </div>
                <div className="project-upload">
                  <div
                    className={`upload-preview ${project.imageUrl ? "has-image" : ""}`}
                  >
                    {project.imageUrl ? (
                      <span
                        style={{
                          backgroundImage: `url("${project.imageUrl}")`,
                        }}
                      />
                    ) : (
                      <ImagesPlaceholder />
                    )}
                    <label className="upload-button">
                      <CloudUpload size={16} />
                      {uploading === i ? "Uploading…" : "Upload project image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={uploading !== null}
                        onChange={(e) => upload(i, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <div>
                    <strong>Show your work.</strong>
                    <p>
                      PNG, JPEG, or WebP. Up to 5 MB. Without an image, the
                      original custom website mockup is used.
                    </p>
                    {project.imageUrl ? (
                      <button
                        type="button"
                        className="admin-inline-link"
                        onClick={() => edit(["projects", i, "imageUrl"], "")}
                      >
                        Use default mockup
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="editor-form-grid">
                  {field("Project name", ["projects", i, "name"], project.name)}
                  {field(
                    "Category",
                    ["projects", i, "category"],
                    project.category,
                  )}
                  {field(
                    "Card headline",
                    ["projects", i, "title"],
                    project.title,
                  )}
                  {field(
                    "Website URL (optional)",
                    ["projects", i, "websiteUrl"],
                    project.websiteUrl,
                    false,
                    "Use the actual project URL, starting with https://.",
                  )}
                  {field(
                    "Description",
                    ["projects", i, "description"],
                    project.description,
                    true,
                  )}
                  <label className="admin-field">
                    <span>Default mockup style</span>
                    <select
                      value={project.theme}
                      onChange={(e) =>
                        edit(["projects", i, "theme"], e.target.value)
                      }
                    >
                      <option value="auto">Automotive</option>
                      <option value="property">Property</option>
                      <option value="retail">Retail / ecommerce</option>
                    </select>
                  </label>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={project.isConcept}
                      onChange={(e) =>
                        edit(["projects", i, "isConcept"], e.target.checked)
                      }
                    />
                    <span>
                      Label this as a concept project
                      <small>
                        Only turn this off for real, completed work.
                      </small>
                    </span>
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-add-button"
              disabled={document.projects.length >= 12}
              onClick={() =>
                edit(
                  ["projects"],
                  [
                    ...document.projects,
                    {
                      id: `project-${crypto.randomUUID().slice(0, 8)}`,
                      name: "New project",
                      title: "A new possibility.",
                      category: "WEBSITE DESIGN",
                      description:
                        "Describe the business needs and the experience you created.",
                      theme: "property",
                      isConcept: true,
                      imageUrl: "",
                      websiteUrl: "",
                    },
                  ],
                )
              }
            >
              <Plus size={18} />
              Add a project
            </button>
          </>
        ) : null}
        {mode === "pricing" ? (
          <>
            {document.pricing.map((plan, i) => (
              <div className="editor-panel" key={i}>
                <div className="editor-panel-heading">
                  <span>PACKAGE 0{i + 1}</span>
                  <h2>{plan.name}</h2>
                </div>
                <div className="editor-form-grid">
                  {field("Package name", ["pricing", i, "name"], plan.name)}
                  {field(
                    "Short description",
                    ["pricing", i, "caption"],
                    plan.caption,
                  )}
                  {field("Price (G$)", ["pricing", i, "price"], plan.price)}
                  {field(
                    "Price prefix",
                    ["pricing", i, "prefix"],
                    plan.prefix,
                    false,
                    "For example: Starting at",
                  )}
                  {field(
                    "Billing label",
                    ["pricing", i, "billing"],
                    plan.billing,
                  )}
                  {field(
                    "Ongoing management",
                    ["pricing", i, "ongoing"],
                    plan.ongoing,
                  )}
                  {list(
                    "Included features",
                    ["pricing", i, "features"],
                    plan.features,
                  )}
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={plan.featured}
                      onChange={(e) =>
                        edit(
                          ["pricing"],
                          document.pricing.map((p, index) => ({
                            ...p,
                            featured: index === i ? e.target.checked : false,
                          })),
                        )
                      }
                    />
                    <span>
                      Recommend this package
                      <small>Only one package can be highlighted.</small>
                    </span>
                  </label>
                </div>
              </div>
            ))}
            <div className="editor-panel promotion-editor">
              <div className="editor-panel-heading">
                <span>FOUNDING CLIENT OFFER</span>
                <h2>Your launch promotion</h2>
              </div>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={document.promotion.enabled}
                  onChange={(e) =>
                    edit(["promotion", "enabled"], e.target.checked)
                  }
                />
                <span>Show the launch offer on the website</span>
              </label>
              <div className="editor-form-grid">
                {Object.entries(document.promotion)
                  .filter(([, v]) => typeof v === "string")
                  .map(([key, value]) =>
                    field(
                      key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (c) => c.toUpperCase()),
                      ["promotion", key],
                      String(value),
                      ["title", "description", "badge", "disclaimer"].includes(
                        key,
                      ),
                    ),
                  )}
                {list(
                  "Offer features",
                  ["promotion", "features"],
                  document.promotion.features,
                )}
              </div>
            </div>
          </>
        ) : null}
        {mode === "faqs" ? (
          <>
            {document.faqs.map((faq, i) => (
              <div className="editor-panel" key={i}>
                <div className="editor-panel-heading with-controls">
                  <span>QUESTION 0{i + 1}</span>
                  {controls("faqs", i)}
                </div>
                <div className="editor-form-grid">
                  {field("Question", ["faqs", i, "question"], faq.question)}
                  {field("Answer", ["faqs", i, "answer"], faq.answer, true)}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-add-button"
              disabled={document.faqs.length >= 20}
              onClick={() =>
                edit(
                  ["faqs"],
                  [
                    ...document.faqs,
                    {
                      question: "A new question?",
                      answer: "Add a clear, helpful answer for your visitors.",
                    },
                  ],
                )
              }
            >
              <Plus size={18} />
              Add a question
            </button>
          </>
        ) : null}
        {mode === "settings" ? (
          <>
            <div className="editor-panel">
              <div className="editor-panel-heading">
                <span>SEARCH & SHARING</span>
                <h2>Make a clear first impression.</h2>
                <p>
                  These details appear in search results and social previews.
                </p>
              </div>
              <div className="editor-form-grid">
                {field(
                  "Page title",
                  ["settings", "seoTitle"],
                  document.settings.seoTitle,
                )}
                {field(
                  "Meta description",
                  ["settings", "seoDescription"],
                  document.settings.seoDescription,
                  true,
                )}
              </div>
            </div>
            <div className="editor-panel">
              <div className="editor-panel-heading">
                <span>YOUR CONTACT CHANNELS</span>
                <h2>Keep the conversation open.</h2>
                <p>
                  Leave optional channels empty to hide them from the public
                  site.
                </p>
              </div>
              <div className="editor-form-grid">
                {field(
                  "Facebook URL",
                  ["settings", "facebookUrl"],
                  document.settings.facebookUrl,
                )}
                {field(
                  "Instagram URL",
                  ["settings", "instagramUrl"],
                  document.settings.instagramUrl,
                )}
                {field(
                  "WhatsApp number",
                  ["settings", "whatsappNumber"],
                  document.settings.whatsappNumber,
                  false,
                  "Use the international format, including the country code.",
                )}
                {field(
                  "Footer description",
                  ["settings", "footerDescription"],
                  document.settings.footerDescription,
                  true,
                )}
                {field(
                  "Pricing disclaimer",
                  ["settings", "pricingDisclaimer"],
                  document.settings.pricingDisclaimer,
                  true,
                )}
              </div>
            </div>
            <div className="admin-info-card">
              <Globe2 size={20} />
              <div>
                <strong>Connection & delivery settings</strong>
                <p>
                  Supabase credentials, email delivery keys, and the production
                  domain are configured through server environment variables.
                  They are never stored in public site content.
                </p>
              </div>
              <ArrowUpRight size={18} />
            </div>
          </>
        ) : null}
      </fieldset>
      <div className="editor-bottom-note">
        <Save size={14} />
        Drafts are private. Only published content is visible on the public
        website.
      </div>
    </div>
  );
}
function ImagesPlaceholder() {
  return (
    <div className="upload-empty">
      <CloudUpload size={25} />
      <span>YOUR NEXT PROJECT</span>
    </div>
  );
}
