import type { SiteDocument } from "@/lib/cms/schema";
import { siteConfiguration, type SiteConfiguration } from "@/lib/site-config";
import { getSitePage, type SitePageKey } from "@/lib/site-pages";
import { pageSearchCopy } from "./metadata";

type SchemaNode = Record<string, unknown> & { "@type": string; "@id": string };

export function siteStructuredData(
  site: SiteDocument,
  config: SiteConfiguration = siteConfiguration(),
  publishedAt?: string,
  page: SitePageKey = "home",
) {
  if (!config.canonicalUrl) return null;
  const url = config.canonicalUrl;
  const organization = `${url}#organization`;
  const website = `${url}#website`;
  const pageUrl = `${config.origin}${getSitePage(page).path}`;
  const webpage = `${pageUrl}#webpage`;
  const searchCopy = pageSearchCopy(site, page);
  const country = { "@type": "Country", name: "Guyana" };
  const services: SchemaNode[] = site.services.map((service) => ({
    "@type": "Service",
    "@id": `${url}#service-${service.type}`,
    name: service.title,
    serviceType: service.title,
    description: service.description,
    url: `${config.origin}/services`,
    provider: { "@id": organization },
    areaServed: country,
  }));
  const graph: SchemaNode[] = [
    {
      "@type": "Organization",
      "@id": organization,
      name: "Content Mark",
      url,
      slogan: "Your Internet Awareness Component",
      description: site.settings.seoDescription,
      areaServed: country,
      logo: {
        "@type": "ImageObject",
        url: `${config.origin}/brand/content-mark-logo.png`,
        width: 1254,
        height: 1254,
        caption: "Content Mark — Advertising / Marketing",
      },
      sameAs: [
        ...new Set(
          [site.settings.facebookUrl, site.settings.instagramUrl].filter(
            Boolean,
          ),
        ),
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        url: `${config.origin}/contact`,
        availableLanguage: "English",
      },
    },
    {
      "@type": "WebSite",
      "@id": website,
      name: "Content Mark",
      url,
      inLanguage: "en-GY",
      publisher: { "@id": organization },
    },
    {
      "@type":
        page === "contact"
          ? "ContactPage"
          : page === "portfolio"
            ? "CollectionPage"
            : "WebPage",
      "@id": webpage,
      url: pageUrl,
      name: searchCopy.title,
      description: searchCopy.description,
      inLanguage: "en-GY",
      isPartOf: { "@id": website },
      about: { "@id": organization },
      ...(["home", "services"].includes(page)
        ? { mainEntity: services.map((service) => ({ "@id": service["@id"] })) }
        : {}),
      ...(page !== "home"
        ? { breadcrumb: { "@id": `${pageUrl}#breadcrumbs` } }
        : {}),
      ...(publishedAt ? { dateModified: publishedAt } : {}),
    },
    ...(["home", "services"].includes(page) ? services : []),
  ];
  if (page !== "home")
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumbs`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: url },
        {
          "@type": "ListItem",
          position: 2,
          name: getSitePage(page).label,
          item: pageUrl,
        },
      ],
    });
  return { "@context": "https://schema.org", "@graph": graph };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
