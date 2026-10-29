import { ArrowUpRight, Check } from "lucide-react";
import type { SiteDocument, SectionCopy } from "@/lib/cms/schema";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/animations/reveal";
import { AdMockup, LeadFlow, PropertyMockup } from "@/components/ui/mockups";
import Link from "next/link";
import { pageHref } from "@/lib/site-pages";
export function Services({
  services,
  copy,
  preview = false,
  headingAs = "h2",
}: {
  services: SiteDocument["services"];
  copy: SectionCopy;
  preview?: boolean;
  headingAs?: "h1" | "h2";
}) {
  const CardHeading = headingAs === "h1" ? "h2" : "h3";
  return (
    <section id="services" className="section services-section">
      <div className="container">
        <SectionHeading copy={copy} headingAs={headingAs} />
        <div className="services-grid">
          {services.map((service, index) => (
            <Reveal
              key={service.number}
              delay={index * 0.08}
              className={`service-card service-${service.type}`}
            >
              <div className="service-top">
                <span className="service-number">/ {service.number}</span>
                <span>{service.title}</span>
                <ArrowUpRight size={18} />
              </div>
              <div className="service-visual" aria-hidden="true">
                {service.type === "website" ? (
                  <PropertyMockup small />
                ) : service.type === "advertising" ? (
                  <AdMockup />
                ) : (
                  <LeadFlow />
                )}
              </div>
              <div className="service-copy">
                <CardHeading>{service.headline}</CardHeading>
                <p>{service.description}</p>
                <ul>
                  {service.features.map((feature) => (
                    <li key={feature}>
                      <Check size={13} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={pageHref("contact", preview, {
                    service: service.title,
                  })}
                  className="service-link"
                >
                  Let&apos;s talk{" "}
                  {service.type === "website"
                    ? "websites"
                    : service.type === "advertising"
                      ? "advertising"
                      : "opportunities"}
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
