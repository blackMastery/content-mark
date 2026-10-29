import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import type { SiteDocument, SectionCopy } from "@/lib/cms/schema";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/animations/reveal";
import Link from "next/link";
import { pageHref } from "@/lib/site-pages";
export function Pricing({
  pricing,
  copy,
  disclaimer,
  preview = false,
  headingAs = "h2",
}: {
  pricing: SiteDocument["pricing"];
  copy: SectionCopy;
  disclaimer: string;
  preview?: boolean;
  headingAs?: "h1" | "h2";
}) {
  const CardHeading = headingAs === "h1" ? "h2" : "h3";
  return (
    <section id="pricing" className="section pricing-section">
      <div className="container">
        <SectionHeading copy={copy} headingAs={headingAs} />
        <div className="pricing-grid">
          {pricing.map((plan, i) => (
            <Reveal
              key={plan.name}
              delay={i * 0.06}
              className={`pricing-card ${plan.featured ? "pricing-featured" : ""}`}
            >
              {plan.featured ? (
                <div className="popular-label">
                  <Sparkles size={12} /> MOST POPULAR{" "}
                  <span>MADE FOR YOUR NEXT STEP</span>
                </div>
              ) : null}
              <div className="pricing-card-inner">
                <span className="plan-index">0{i + 1} / THE PACKAGE</span>
                <CardHeading>{plan.name}</CardHeading>
                <p className="plan-caption">{plan.caption}</p>
                <div className="plan-price">
                  {plan.prefix ? (
                    <span className="price-prefix">{plan.prefix}</span>
                  ) : null}
                  <span className="currency">G$</span>
                  <strong>{plan.price}</strong>
                  <span className="price-billing">{plan.billing}</span>
                </div>
                <Link
                  href={pageHref("contact", preview, { package: plan.name })}
                  className={`button ${plan.featured ? "" : "button-outline"}`}
                >
                  Choose {plan.name} <ArrowUpRight size={17} />
                </Link>
                <div className="plan-includes">WHAT&apos;S INCLUDED</div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={15} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="plan-ongoing">{plan.ongoing}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="pricing-disclaimer">{disclaimer}</p>
      </div>
    </section>
  );
}
export function LaunchOffer({
  offer,
  preview = false,
}: {
  offer: SiteDocument["promotion"];
  preview?: boolean;
}) {
  if (!offer.enabled) return null;
  return (
    <section className="offer-section">
      <Reveal className="container">
        <div className="offer-panel">
          <div className="offer-art" aria-hidden="true">
            <span>
              YOUR
              <br />
              NEXT
              <br />
              <em>MOVE.</em>
            </span>
            <ArrowUpRight strokeWidth={0.8} />
            <i />
          </div>
          <div className="offer-copy">
            <span className="eyebrow">
              <span className="gold-dot" /> {offer.eyebrow}
            </span>
            <h2 className="cms-lines">{offer.title}</h2>
            <p>{offer.description}</p>
            <div className="offer-inclusions">
              {offer.features.map((feature) => (
                <span key={feature}>
                  <Check size={13} />
                  {feature}
                </span>
              ))}
            </div>
            <div className="offer-price-row">
              <div className="offer-price">
                <span>G$</span>
                {offer.price} <del>G${offer.regularPrice}</del>
              </div>
              <span className="offer-badge cms-lines">{offer.badge}</span>
            </div>
            <Link
              href={pageHref("contact", preview, {
                package: "Founding Client Offer",
              })}
              className="button button-gold"
            >
              {offer.cta} <ArrowUpRight size={17} />
            </Link>
            <small>{offer.disclaimer}</small>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
