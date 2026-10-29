import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteDocument } from "@/lib/cms/schema";
import { pageHref } from "@/lib/site-pages";

export function HomeOverview({
  site,
  preview = false,
}: {
  site: SiteDocument;
  preview?: boolean;
}) {
  return (
    <section className="section home-overview">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <span className="section-mark" />
              {site.headings.services.eyebrow}
            </span>
            <h2>
              {site.headings.services.title}
              <br />
              <span className="text-muted">
                {site.headings.services.accent}
              </span>
            </h2>
          </div>
          <p>{site.headings.services.description}</p>
        </div>
        <div className="home-service-grid">
          {site.services.map((service) => (
            <Link
              className="home-service-card"
              key={service.type}
              href={pageHref("services", preview)}
            >
              <span className="eyebrow">
                / {service.number}
                <ArrowUpRight size={19} />
              </span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="home-card-link">
                Explore services <ArrowUpRight size={15} />
              </span>
            </Link>
          ))}
        </div>
        <div className="home-page-links">
          <Link href={pageHref("portfolio", preview)}>
            Explore our portfolio <ArrowUpRight size={17} />
          </Link>
          <Link href={pageHref("process", preview)}>
            How we work <ArrowUpRight size={17} />
          </Link>
          <Link href={pageHref("pricing", preview)}>
            Find your package <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
