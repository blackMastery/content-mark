import assert from "node:assert/strict";
import { test } from "node:test";
import { siteConfiguration } from "../src/lib/site-config";
import { homeMetadata } from "../src/lib/seo/metadata";
import { siteStructuredData, serializeJsonLd } from "../src/lib/seo/structured-data";
import { publicSitemap, crawlerRules } from "../src/lib/seo/crawlers";
import { defaultSiteDocument } from "../src/lib/cms/defaults";

// Example origins are fixtures, never a proposed production domain.
const production = siteConfiguration({
  NEXT_PUBLIC_SITE_URL: "https://agency.example.com/",
  NODE_ENV: "production",
});

test("only an explicitly configured public HTTPS production site is indexable", () => {
  assert.equal(production.indexable, true);
  for (const env of [
    {},
    { NODE_ENV: "production" },
    { NEXT_PUBLIC_SITE_URL: "http://localhost:3000", NODE_ENV: "production" },
    { NEXT_PUBLIC_SITE_URL: "https://127.0.0.1", NODE_ENV: "production" },
    { NEXT_PUBLIC_SITE_URL: "https://agency.local", NODE_ENV: "production" },
    { NEXT_PUBLIC_SITE_URL: production.origin, NODE_ENV: "development" },
    { NEXT_PUBLIC_SITE_URL: production.origin, NODE_ENV: "production", VERCEL_ENV: "preview" },
    { NEXT_PUBLIC_SITE_URL: production.origin, NODE_ENV: "production", SITE_INDEXING_ENABLED: "false" },
  ]) assert.equal(siteConfiguration(env).indexable, false);
  assert.equal(siteConfiguration({}).canonicalUrl, undefined);
});

test("domain configuration refuses silently misleading origins", () => {
  for (const origin of ["not a URL", "ftp://agency.example.com", "https://user:secret@agency.example.com", "https://agency.example.com/subpage", "https://agency.example.com?tracking=1", "https://agency.example.com/#home"]) {
    assert.throws(() => siteConfiguration({ NEXT_PUBLIC_SITE_URL: origin }), /NEXT_PUBLIC_SITE_URL/);
  }
});

test("CMS search edits keep complete absolute OG and Twitter metadata", () => {
  const site = structuredClone(defaultSiteDocument);
  site.settings.seoTitle = "An edited search title | Content Mark";
  site.settings.seoDescription = "A published description with website and advertising services for Guyana.";
  const metadata = homeMetadata(site, 17, production);
  assert.equal(metadata.title, site.settings.seoTitle);
  assert.equal(metadata.description, site.settings.seoDescription);
  assert.deepEqual(metadata.alternates, { canonical: production.origin + "/" });
  assert.equal(metadata.openGraph?.type, "website");
  assert.equal(metadata.openGraph?.siteName, "Content Mark");
  assert.equal(metadata.openGraph?.locale, "en_GY");
  assert.equal(metadata.openGraph?.url, production.origin + "/");
  const images = metadata.openGraph?.images as { url: string; width: number; height: number; alt: string; type: string }[];
  assert.equal(images.length, 1);
  assert.equal(images[0].url, production.origin + "/opengraph-image?v=17");
  assert.equal(images[0].width, 1200);
  assert.equal(images[0].height, 630);
  assert.equal(images[0].type, "image/png");
  assert.ok(images[0].alt.includes("Content Mark"));
  assert.equal(metadata.twitter?.card, "summary_large_image");
  assert.deepEqual(metadata.twitter?.images, images);
});

test("staging has no indexable sitemap or fabricated canonical", () => {
  const local = siteConfiguration({ NODE_ENV: "production" });
  const metadata = homeMetadata(defaultSiteDocument, 1, local);
  assert.deepEqual(metadata.alternates, { canonical: null });
  assert.equal((metadata.robots as { index: boolean }).index, false);
  assert.deepEqual(publicSitemap(local), []);
  assert.equal(crawlerRules(local).sitemap, undefined);
  // Crawlers must be able to see page/header noindex instructions.
  assert.deepEqual(crawlerRules(local).rules, { userAgent: "*", allow: "/", disallow: ["/api/"] });
});

test("sitemap uses the published timestamp and contains only the canonical page", () => {
  const publishedAt = "2026-10-27T19:50:37.000Z";
  assert.deepEqual(publicSitemap(production, publishedAt), [{ url: production.origin + "/", lastModified: publishedAt }]);
  assert.deepEqual(publicSitemap(production), [{ url: production.origin + "/" }]);
  assert.equal(crawlerRules(production).sitemap, production.origin + "/sitemap.xml");
});

test("schema describes confirmed organization and visible services without invented local-business facts", () => {
  const schema = siteStructuredData(defaultSiteDocument, production);
  assert.ok(schema);
  const graph = schema["@graph"];
  const organization = graph.find((node) => node["@type"] === "Organization");
  assert.ok(organization);
  assert.equal(organization.name, "Content Mark");
  assert.deepEqual(organization.areaServed, { "@type": "Country", name: "Guyana" });
  assert.equal((organization.logo as { url: string }).url, production.origin + "/brand/content-mark-logo.png");
  assert.deepEqual(organization.sameAs, [defaultSiteDocument.settings.facebookUrl]);
  for (const missingFact of ["address", "openingHours", "aggregateRating", "telephone", "email", "foundingDate"]) {
    assert.equal(missingFact in organization, false);
  }
  assert.equal(graph.filter((node) => node["@type"] === "Service").length, 3);
  assert.ok(graph.some((node) => node["@type"] === "WebSite"));
  assert.ok(graph.some((node) => node["@type"] === "WebPage"));
  assert.equal(siteStructuredData(defaultSiteDocument, siteConfiguration({})), null);
});

test("structured data follows published edits and cannot break out of its script", () => {
  const site = structuredClone(defaultSiteDocument);
  site.services[0].title = "</script><script>alert('cms')</script>";
  const schema = siteStructuredData(site, production);
  const serialized = serializeJsonLd(schema);
  assert.equal(serialized.includes("<"), false);
  assert.deepEqual(JSON.parse(serialized), schema);
  const service = schema?.["@graph"].find((node) => node["@type"] === "Service");
  assert.equal(service?.name, site.services[0].title);
});
