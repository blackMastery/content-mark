import type { SiteDocument } from "@/lib/cms/schema";
import { siteConfiguration, type SiteConfiguration } from "@/lib/site-config";

type SchemaNode = Record<string, unknown> & { "@type": string; "@id": string };

export function siteStructuredData(
  site: SiteDocument,
  config: SiteConfiguration = siteConfiguration(),
  publishedAt?: string,
) {
  if (!config.canonicalUrl) return null;
  const url = config.canonicalUrl;
  const organization = `${url}#organization`;
  const website = `${url}#website`;
  const webpage = `${url}#webpage`;
  const country = { "@type": "Country", name: "Guyana" };
  const services: SchemaNode[] = site.services.map((service) => ({
    "@type": "Service",
    "@id": `${url}#service-${service.type}`,
    name: service.title,
    serviceType: service.title,
    description: service.description,
    url: `${url}#services`,
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
        url: `${url}#contact`,
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
      "@type": "WebPage",
      "@id": webpage,
      url,
      name: site.settings.seoTitle,
      description: site.settings.seoDescription,
      inLanguage: "en-GY",
      isPartOf: { "@id": website },
      about: { "@id": organization },
      mainEntity: services.map((service) => ({ "@id": service["@id"] })),
      ...(publishedAt ? { dateModified: publishedAt } : {}),
    },
    ...services,
  ];
  return { "@context": "https://schema.org", "@graph": graph };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
