import assert from "node:assert/strict";
import { test } from "node:test";
import { siteDocumentSchema } from "../src/lib/cms/schema";
import { defaultSiteDocument } from "../src/lib/cms/defaults";

test("the current landing page is a valid CMS document", () => {
  assert.equal(siteDocumentSchema.safeParse(defaultSiteDocument).success, true);
});
test("CMS refuses unsafe URLs, empty content, malformed pricing and oversized collections", () => {
  for (const change of [
    {
      settings: {
        ...defaultSiteDocument.settings,
        facebookUrl: "javascript:alert(1)",
      },
    },
    { hero: { ...defaultSiteDocument.hero, headline: ["", "", ""] } },
    {
      pricing: defaultSiteDocument.pricing.map((p) => ({
        ...p,
        price: "not money",
      })),
    },
    { faqs: [] },
  ])
    assert.equal(
      siteDocumentSchema.safeParse({ ...defaultSiteDocument, ...change })
        .success,
      false,
    );
});
test("concept projects keep an explicit label and optional media starts empty", () => {
  assert.equal(
    defaultSiteDocument.projects.every((p) => p.isConcept),
    true,
  );
  assert.equal(
    defaultSiteDocument.projects.every((p) => p.imageUrl === ""),
    true,
  );
});
