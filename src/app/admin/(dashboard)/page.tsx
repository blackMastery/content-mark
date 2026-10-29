import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Globe2,
  Images,
  Inbox,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import { requireAdmin } from "@/lib/supabase/admin";
import { siteDocumentSchema } from "@/lib/cms/schema";
import { PropertyMockup } from "@/components/ui/mockups";

export default async function OverviewPage() {
  const { client } = await requireAdmin();
  const [site, draft, total, fresh, recent] = await Promise.all([
    client
      .from("site_content")
      .select("document,updated_at,revision")
      .eq("id", "main")
      .single(),
    client
      .from("site_drafts")
      .select("revision,published_revision,updated_at")
      .eq("id", "main")
      .single(),
    client.from("inquiries").select("id", { count: "exact", head: true }),
    client
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    client
      .from("inquiries")
      .select("id,name,business,service,status,created_at")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);
  if (site.error || draft.error || total.error || fresh.error || recent.error)
    throw new Error("Workspace data couldn't be loaded.");
  const content = siteDocumentSchema.parse(site.data.document);
  const unpublished = draft.data.revision !== draft.data.published_revision;
  const stats = [
    {
      label: "New inquiries",
      value: fresh.count || 0,
      detail: "Conversations waiting to begin",
      icon: Inbox,
      href: "/admin/inquiries?status=new",
    },
    {
      label: "Total inquiries",
      value: total.count || 0,
      detail: "Every opportunity, in one place",
      icon: ArrowUpRight,
      href: "/admin/inquiries",
    },
    {
      label: "Published projects",
      value: content.projects.length,
      detail: content.projects.some((p) => p.isConcept)
        ? `${content.projects.filter((p) => p.isConcept).length} clearly labeled concepts`
        : "Website development portfolio",
      icon: Images,
      href: "/admin/projects",
    },
    {
      label: "Live packages",
      value: content.pricing.length,
      detail: content.promotion.enabled
        ? "Launch offer is active"
        : "Launch offer is hidden",
      icon: LayoutTemplate,
      href: "/admin/pricing",
    },
  ];
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">YOUR BRAND. YOUR NEXT CHAPTER.</span>
          <h1>
            A little overview.
            <br />
            <em>A lot of possibility.</em>
          </h1>
          <p>Your website, content, and new opportunities. All in one place.</p>
        </div>
        <Link href="/admin/content" className="admin-primary">
          Make an update <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="admin-welcome-strip">
        <div>
          <span className="admin-live-dot" />
          <strong>Your website is connected.</strong>
          <span>
            Content, inquiries, and media are supported by local Supabase.
          </span>
        </div>
        <span className="environment-badge">LOCAL DEVELOPMENT</span>
      </div>
      <div className="admin-stats">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.label} className="admin-stat">
            <div>
              <span>{stat.label}</span>
              <stat.icon size={18} strokeWidth={1.5} />
            </div>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </Link>
        ))}
      </div>
      <div className="overview-grid">
        <div className="admin-panel overview-inquiries">
          <div className="admin-panel-title">
            <div>
              <span className="admin-eyebrow">YOUR NEXT CONVERSATIONS</span>
              <h2>Recent inquiries</h2>
            </div>
            <Link href="/admin/inquiries">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {recent.data.length ? (
            <div className="recent-inquiry-list">
              {recent.data.map((inquiry) => (
                <Link href={`/admin/inquiries/${inquiry.id}`} key={inquiry.id}>
                  <span className="inquiry-initial">
                    {inquiry.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <strong>{inquiry.name}</strong>
                    <small>
                      {inquiry.business} · {inquiry.service}
                    </small>
                  </div>
                  <span className={`inquiry-status status-${inquiry.status}`}>
                    {inquiry.status}
                  </span>
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="inquiries-empty">
              <div className="empty-inbox-art">
                <Inbox size={34} strokeWidth={1.1} />
                <i />
                <i />
              </div>
              <h3>Good conversations start here.</h3>
              <p>
                When someone sends an inquiry from your website, it will appear
                here. Keep track of every next step.
              </p>
              <Link
                href="/contact"
                target="_blank"
                className="admin-inline-link"
              >
                View your contact form <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
        </div>
        <div className="admin-panel overview-site">
          <div className="admin-panel-title">
            <div>
              <span className="admin-eyebrow">YOUR DIGITAL PRESENCE</span>
              <h2>Ready for what&apos;s next.</h2>
            </div>
            <span className="admin-status">
              <i />
              Published
            </span>
          </div>
          <div className="overview-site-visual" aria-hidden="true">
            <PropertyMockup />
          </div>
          <div className="overview-site-caption">
            <div>
              <strong>Content Mark</strong>
              <small>Website & digital growth agency</small>
            </div>
            <Link
              href="/"
              target="_blank"
              className="admin-round-link"
              aria-label="Open public website"
            >
              <ArrowUpRight size={20} />
            </Link>
          </div>
          <div className="overview-published">
            <Check size={13} />
            <span>
              Published{" "}
              {new Date(site.data.updated_at).toLocaleDateString("en-GB", {
                dateStyle: "medium",
                timeZone: "America/Guyana",
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="overview-bottom-grid">
        <div className="admin-panel publishing-card">
          <span className="publishing-icon">
            <FileText size={22} />
          </span>
          <div>
            <span className="admin-eyebrow">YOUR PUBLISHING WORKSPACE</span>
            <h2>
              {unpublished
                ? "Your next update is taking shape."
                : "Everything is up to date."}
            </h2>
            <p>
              {unpublished
                ? "You have saved changes that haven't been published. Preview your draft, then share it with the world when you're ready."
                : "Start with a draft. Take your time. Publish when the details feel right."}
            </p>
          </div>
          <Link href="/admin/content" className="admin-secondary">
            {unpublished ? "Review draft" : "Edit content"}
            <ArrowRight size={15} />
          </Link>
        </div>
        <div className="admin-panel quick-actions">
          <span className="admin-eyebrow">A FEW GOOD NEXT STEPS</span>
          <Link href="/admin/projects">
            <Images size={17} />
            Refresh your portfolio
            <ArrowUpRight size={14} />
          </Link>
          <Link href="/admin/pricing">
            <Sparkles size={17} />
            Review your launch offer
            <ArrowUpRight size={14} />
          </Link>
          <Link href="/admin/settings">
            <Globe2 size={17} />
            Update your contact links
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}
