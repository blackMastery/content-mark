import assert from "node:assert/strict";
import { test } from "node:test";
import { siteDocumentSchema } from "../src/lib/cms/schema";
import { defaultSiteDocument } from "../src/lib/cms/defaults";
import { readFileSync } from "node:fs";
import { isAllowedProjectImage } from "../src/lib/cms/project-media";

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
test("the portfolio contains all nine real website projects with local WebP previews and live links", () => {
  assert.equal(defaultSiteDocument.projects.length, 9);
  for (const project of defaultSiteDocument.projects) {
    assert.equal(project.isConcept, false);
    assert.ok(project.websiteUrl.startsWith("https://"));
    assert.ok(project.imageUrl.startsWith("/portfolio/"));
    const image = readFileSync(`public${project.imageUrl}`);
    assert.equal(image.toString("ascii", 0, 4), "RIFF");
    assert.equal(image.toString("ascii", 8, 12), "WEBP");
  }
});
test("project media accepts bundled previews and site uploads while rejecting arbitrary local paths and foreign storage", () => {
  const storage = "http://127.0.0.1:54321";
  assert.equal(
    isAllowedProjectImage("/portfolio/poshhomedecor.webp", storage),
    true,
  );
  assert.equal(
    isAllowedProjectImage(
      `${storage}/storage/v1/object/public/site-media/projects/example.webp`,
      storage,
    ),
    true,
  );
  for (const imageUrl of [
    "/portfolio/unknown.webp",
    "/portfolio/../private.webp",
    "/brand/content-mark-logo.png",
    "//foreign.example/image.webp",
    "https://foreign.example/storage/v1/object/public/site-media/image.webp",
  ]) {
    assert.equal(isAllowedProjectImage(imageUrl, storage), false);
    assert.equal(
      siteDocumentSchema.safeParse({
        ...defaultSiteDocument,
        projects: [{ ...defaultSiteDocument.projects[0], imageUrl }],
      }).success,
      imageUrl.startsWith("https://"),
    );
  }
});
