import assert from "node:assert/strict";
import { test } from "node:test";
import {
  sitePages,
  pageHref,
  legacyPageDestination,
} from "../src/lib/site-pages";
import { pageMetadata } from "../src/lib/seo/metadata";
import { defaultSiteDocument } from "../src/lib/cms/defaults";
import { siteConfiguration } from "../src/lib/site-config";
import { publicSitemap } from "../src/lib/seo/crawlers";
import { siteStructuredData } from "../src/lib/seo/structured-data";

const production = siteConfiguration({
  NODE_ENV: "production",
  NEXT_PUBLIC_SITE_URL: "https://agency.example.com",
});

test("the public site has eight distinct destinations and query-safe contact links", () => {
  assert.deepEqual(
    sitePages.map((page) => page.path),
    [
      "/",
      "/services",
      "/process",
      "/portfolio",
      "/pricing",
      "/faqs",
      "/blog",
      "/contact",
    ],
  );
  assert.equal(
    pageHref("contact", false, { service: "Lead Generation & Conversion" }),
    "/contact?service=Lead+Generation+%26+Conversion",
  );
  const draft = new URL(
    pageHref("contact", true, { package: "Business Growth" }),
    "https://agency.example.com",
  );
  assert.equal(draft.pathname, "/admin/preview");
  assert.equal(draft.searchParams.get("page"), "contact");
  assert.equal(draft.searchParams.get("package"), "Business Growth");
});

test("old section bookmarks and inquiry links map to the new pages", () => {
  assert.equal(legacyPageDestination("", "#work"), "/portfolio");
  assert.equal(
    legacyPageDestination(
      "?package=Business%20Growth&utm_source=facebook",
      "#contact",
    ),
    "/contact?package=Business%20Growth&utm_source=facebook",
  );
  assert.equal(legacyPageDestination("", "#faq"), "/faqs");
  assert.equal(legacyPageDestination("", "#main"), undefined);
  assert.equal(legacyPageDestination("", "#home"), undefined);
});

test("each page has its own canonical and search/share copy without query parameters", () => {
  const titles = new Set();
  for (const page of sitePages) {
    const metadata = pageMetadata(defaultSiteDocument, 2, page.key, production);
    titles.add(metadata.title);
    const canonical = production.origin + page.path;
    assert.deepEqual(metadata.alternates, { canonical });
    assert.equal(metadata.openGraph.url, canonical);
    assert.equal(metadata.twitter.title, metadata.title);
    assert.equal(metadata.openGraph.description, metadata.description);
    assert.ok(metadata.description);
  }
  assert.equal(titles.size, sitePages.length);
  assert.deepEqual(
    publicSitemap(production).map((page) => page.url),
    sitePages.map((page) => production.origin + page.path),
  );
});

test("inner-page structured data describes the current route and its breadcrumbs", () => {
  const graph = siteStructuredData(
    defaultSiteDocument,
    production,
    undefined,
    "contact",
  )!["@graph"];
  const contact = graph.find((node) => node["@type"] === "ContactPage")!;
  assert.equal(contact.url, production.origin + "/contact");
  const breadcrumbs = graph.find((node) => node["@type"] === "BreadcrumbList")!;
  assert.deepEqual(
    (breadcrumbs.itemListElement as { item: string }[]).map(
      (item) => item.item,
    ),
    [production.origin + "/", production.origin + "/contact"],
  );
  assert.equal(
    graph.some((node) => node["@type"] === "Service"),
    false,
  );
});
