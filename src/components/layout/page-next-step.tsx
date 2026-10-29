import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteDocument } from "@/lib/cms/schema";
import { getSitePage, pageHref, type SitePageKey } from "@/lib/site-pages";

export function PageNextStep({
  site,
  page,
  preview,
}: {
  site: SiteDocument;
  page: SitePageKey;
  preview: boolean;
}) {
  const next: SitePageKey =
    page === "pricing"
      ? "faqs"
      : page === "portfolio"
        ? "pricing"
        : page === "services"
          ? "portfolio"
          : "services";
  return (
    <section className="page-next-step">
      <div className="container">
        <div>
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2 className="cms-lines">
            {site.headings.contact.title}{" "}
            <span className="text-mint">{site.headings.contact.accent}</span>
          </h2>
          <p>{site.headings.contact.description}</p>
        </div>
        <div className="page-next-actions">
          <Link href={pageHref("contact", preview)} className="button">
            Start Your Project <ArrowUpRight size={18} />
          </Link>
          <Link href={pageHref(next, preview)} className="text-button">
            Explore {getSitePage(next).label} <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
