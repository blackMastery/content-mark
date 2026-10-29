import { Navigation } from "@/components/layout/navigation";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { LegacySectionRedirect } from "@/components/layout/legacy-section-redirect";
import { PageNextStep } from "@/components/layout/page-next-step";
import { Hero } from "@/components/sections/hero";
import { HomeOverview } from "@/components/sections/home-overview";
import { Services } from "@/components/sections/services";
import { WhyContentMark } from "@/components/sections/why";
import { Process } from "@/components/sections/process";
import { Work } from "@/components/sections/work";
import { LaunchOffer, Pricing } from "@/components/sections/pricing";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { getServiceOptions } from "@/lib/cms/options";
import type { SiteDocument } from "@/lib/cms/schema";
import { getSitePage, pageHref, type SitePageKey } from "@/lib/site-pages";

export function SiteView({
  site,
  page = "home",
  preview = false,
  children,
}: {
  site: SiteDocument;
  page?: SitePageKey;
  preview?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div id="top" className={preview ? "site-preview" : undefined}>
      {preview ? (
        <div className="draft-preview-banner">
          <span>
            PRIVATE DRAFT PREVIEW · {getSitePage(page).label} · These changes
            are not public.
          </span>
          <Link href="/admin/content">Return to the editor ↗</Link>
        </div>
      ) : null}
      {page === "home" && !preview ? <LegacySectionRedirect /> : null}
      <Navigation page={page} preview={preview} />
      <main id="main" className={page === "home" ? undefined : "inner-page"}>
        {page !== "home" ? (
          <nav className="container page-breadcrumb" aria-label="Breadcrumb">
            <Link href={pageHref("home", preview)}>Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{getSitePage(page).label}</span>
          </nav>
        ) : null}
        {children}
        {page === "home" ? (
          <>
            <Hero hero={site.hero} preview={preview} />
            <HomeOverview site={site} preview={preview} />
            <WhyContentMark
              advantages={site.advantages}
              copy={site.headings.why}
              preview={preview}
            />
          </>
        ) : null}
        {page === "services" ? (
          <Services
            services={site.services}
            copy={site.headings.services}
            headingAs="h1"
            preview={preview}
          />
        ) : null}
        {page === "process" ? (
          <Process
            steps={site.steps}
            copy={site.headings.process}
            headingAs="h1"
          />
        ) : null}
        {page === "portfolio" ? (
          <Work
            projects={site.projects}
            copy={site.headings.work}
            headingAs="h1"
            preview={preview}
            websiteService={
              site.services.find((service) => service.type === "website")
                ?.title || site.services[0].title
            }
          />
        ) : null}
        {page === "pricing" ? (
          <>
            <Pricing
              pricing={site.pricing}
              copy={site.headings.pricing}
              disclaimer={site.settings.pricingDisclaimer}
              headingAs="h1"
              preview={preview}
            />
            <LaunchOffer offer={site.promotion} preview={preview} />
          </>
        ) : null}
        {page === "faqs" ? (
          <FAQ
            faqs={site.faqs}
            copy={site.headings.faq}
            headingAs="h1"
            preview={preview}
          />
        ) : null}
        {page === "contact" ? (
          <Contact
            copy={site.headings.contact}
            settings={site.settings}
            options={getServiceOptions(site)}
            headingAs="h1"
            preview={preview}
          />
        ) : (
          <PageNextStep site={site} page={page} preview={preview} />
        )}
      </main>
      <Footer
        settings={site.settings}
        services={site.services}
        preview={preview}
      />
    </div>
  );
}
