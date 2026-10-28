import { Navigation } from "@/components/layout/navigation";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { WhyContentMark } from "@/components/sections/why";
import { Process } from "@/components/sections/process";
import { Work } from "@/components/sections/work";
import { LaunchOffer, Pricing } from "@/components/sections/pricing";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { getServiceOptions } from "@/lib/cms/options";
import type { SiteDocument } from "@/lib/cms/schema";

export function SiteView({
  site,
  preview = false,
}: {
  site: SiteDocument;
  preview?: boolean;
}) {
  return (
    <div className={preview ? "site-preview" : undefined}>
      {preview ? (
        <div className="draft-preview-banner">
          <span>PRIVATE DRAFT PREVIEW · These changes are not public.</span>
          <Link href="/admin/content">Return to the editor ↗</Link>
        </div>
      ) : null}
      <Navigation />
      <main id="main">
        <Hero hero={site.hero} />
        <Services services={site.services} copy={site.headings.services} />
        <WhyContentMark advantages={site.advantages} copy={site.headings.why} />
        <Process steps={site.steps} copy={site.headings.process} />
        <Work
          projects={site.projects}
          copy={site.headings.work}
          websiteService={
            site.services.find((service) => service.type === "website")
              ?.title || site.services[0].title
          }
        />
        <Pricing
          pricing={site.pricing}
          copy={site.headings.pricing}
          disclaimer={site.settings.pricingDisclaimer}
        />
        <LaunchOffer offer={site.promotion} />
        <FAQ faqs={site.faqs} copy={site.headings.faq} />
        <Contact
          copy={site.headings.contact}
          settings={site.settings}
          options={getServiceOptions(site)}
        />
      </main>
      <Footer settings={site.settings} services={site.services} />
    </div>
  );
}
