import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { siteConfiguration } from "../src/lib/site-config.ts";
import { sitePages } from "../src/lib/site-pages.ts";

const base = new URL(process.argv[2] || "http://127.0.0.1:3000");
const config = siteConfiguration({
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || "production",
});
const timeout = () => AbortSignal.timeout(20000);
const decode = (text) =>
  text.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (_, entity) => {
    if (entity.startsWith("#"))
      return String.fromCodePoint(
        parseInt(
          entity.slice(entity[1] === "x" ? 2 : 1),
          entity[1] === "x" ? 16 : 10,
        ),
      );
    return { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" }[entity];
  });
function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [
      name,
      decode(value),
    ]),
  );
}
function metadata(html) {
  const tags = [...html.matchAll(/<meta\s[^>]+>/g)].map(([tag]) =>
    attributes(tag),
  );
  const get = (key) =>
    tags
      .filter((tag) => tag.name === key || tag.property === key)
      .map((tag) => tag.content);
  const canonicals = [...html.matchAll(/<link\s[^>]+>/g)]
    .map(([tag]) => attributes(tag))
    .filter((tag) => tag.rel === "canonical");
  return { get, canonicals };
}
async function fetchPage(path, userAgent = "facebookexternalhit/1.1") {
  const response = await fetch(new URL(path, base), {
    headers: { "User-Agent": userAgent },
    signal: timeout(),
  });
  return { response, html: await response.text() };
}

const pages = [];
for (const userAgent of [
  "facebookexternalhit/1.1",
  "Twitterbot/1.0",
  "Googlebot",
  "Mozilla/5.0",
]) {
  const { response, html } = await fetchPage(
    "/?service=Website%20Development",
    userAgent,
  );
  assert.equal(response.status, 200, "Home page must be available");
  assert.equal(
    (html.match(/<h1(?:\s[^>]*)?>/g) || []).length,
    1,
    "Exactly one server-rendered H1",
  );
  assert.match(html, /<html[^>]*lang="en-GY"/);
  const { get, canonicals } = metadata(html);
  for (const key of [
    "description",
    "og:title",
    "og:description",
    "og:type",
    "og:site_name",
    "og:locale",
    "og:image",
    "og:image:type",
    "og:image:width",
    "og:image:height",
    "og:image:alt",
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "twitter:image:alt",
  ]) {
    assert.equal(
      get(key).length,
      1,
      `One complete ${key} tag for ${userAgent}`,
    );
    assert.ok(get(key)[0]);
  }
  assert.equal(get("og:type")[0], "website");
  assert.equal(get("og:locale")[0], "en_GY");
  assert.equal(get("twitter:card")[0], "summary_large_image");
  assert.equal(get("og:image")[0], get("twitter:image")[0]);
  assert.equal(new URL(get("og:image")[0]).origin, config.origin);
  assert.equal(get("og:image:width")[0], "1200");
  assert.equal(get("og:image:height")[0], "630");
  assert.equal(
    get("og:title")[0],
    decode(html.match(/<title>(.*?)<\/title>/s)[1]),
  );
  assert.equal(get("description")[0], get("og:description")[0]);
  if (/facebookexternalhit|Twitterbot/.test(userAgent)) {
    assert.ok(
      html.split("</head>")[0].includes('property="og:title"'),
      "Social bots receive blocking head metadata",
    );
  }
  assert.equal(canonicals.length, config.canonicalUrl ? 1 : 0);
  if (config.canonicalUrl)
    assert.equal(new URL(canonicals[0].href).href, config.canonicalUrl);
  assert.equal(get("robots")[0].includes("noindex"), !config.indexable);
  if (!config.indexable)
    assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
  else
    assert.doesNotMatch(response.headers.get("x-robots-tag") || "", /noindex/);
  const jsonLd = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ].map(([, json]) => JSON.parse(json));
  assert.equal(jsonLd.length, config.canonicalUrl ? 1 : 0);
  if (jsonLd.length) {
    const graph = jsonLd[0]["@graph"];
    assert.equal(graph.filter((item) => item["@type"] === "Service").length, 3);
    assert.ok(graph.find((item) => item["@type"] === "Organization").logo.url);
  }
  pages.push({
    userAgent,
    title: get("og:title")[0],
    description: get("description")[0],
    image: get("og:image")[0],
    canonical: canonicals[0]?.href || null,
    robots: get("robots")[0],
    structuredDataNodes: jsonLd[0]?.["@graph"].length || 0,
  });
}

const routeChecks = [];
const routeHtml = new Map();
const uniqueTitles = new Set();
for (const page of sitePages) {
  const { response, html } = await fetchPage(page.path);
  assert.equal(
    response.status,
    200,
    `${page.path} must be directly accessible`,
  );
  assert.equal(
    (html.match(/<h1(?:\s[^>]*)?>/g) || []).length,
    1,
    `${page.path} needs exactly one H1`,
  );
  const { get, canonicals } = metadata(html);
  const title = get("og:title")[0];
  assert.ok(title);
  uniqueTitles.add(title);
  assert.equal(get("twitter:title")[0], title);
  assert.equal(get("description")[0], get("og:description")[0]);
  assert.equal(canonicals.length, config.canonicalUrl ? 1 : 0);
  if (config.canonicalUrl) {
    const expected = config.origin + page.path;
    assert.equal(new URL(canonicals[0].href).href, expected);
    assert.equal(new URL(get("og:url")[0]).href, expected);
  }
  routeHtml.set(page.path, html);
  routeChecks.push({
    path: page.path,
    title,
    canonical: canonicals[0]?.href || null,
  });
}
assert.equal(
  uniqueTitles.size,
  sitePages.length,
  "Public pages need distinct titles",
);
for (const [path, html] of routeHtml) {
  for (const [tag] of html.matchAll(/<a\s[^>]+>/g)) {
    const href = attributes(tag).href;
    if (
      !href ||
      (!href.startsWith("/") && !href.startsWith("#")) ||
      href.startsWith("//")
    )
      continue;
    const link = new URL(href, new URL(path, base));
    assert.ok(
      routeHtml.has(link.pathname),
      `Internal link ${href} on ${path} must resolve to a public page`,
    );
    if (link.hash)
      assert.ok(
        routeHtml
          .get(link.pathname)
          .includes(`id="${decodeURIComponent(link.hash.slice(1))}"`),
        `Fragment ${href} on ${path} must exist`,
      );
  }
}

const { response: loginResponse, html: loginHtml } =
  await fetchPage("/admin/login");
assert.equal(loginResponse.status, 200);
assert.match(loginResponse.headers.get("x-robots-tag") || "", /noindex/);
const privateMeta = metadata(loginHtml);
assert.match(privateMeta.get("robots")[0], /noindex/);
assert.equal(privateMeta.canonicals.length, 0);
assert.equal(privateMeta.get("og:image").length, 0);
assert.equal(privateMeta.get("twitter:image").length, 0);

const { response: notFoundResponse, html: notFoundHtml } = await fetchPage(
  "/seo-check-missing-page",
);
assert.equal(notFoundResponse.status, 404);
assert.match(metadata(notFoundHtml).get("robots").join(","), /noindex/);
assert.equal(metadata(notFoundHtml).canonicals.length, 0);

const { html: robots } = await fetchPage("/robots.txt");
assert.match(robots, /Disallow: \/api\//);
assert.equal(robots.includes("Sitemap:"), config.indexable);
const { response: sitemapResponse, html: sitemap } =
  await fetchPage("/sitemap.xml");
assert.equal(sitemapResponse.status, 200);
assert.equal(
  (sitemap.match(/<loc>/g) || []).length,
  config.indexable ? sitePages.length : 0,
);
if (config.indexable)
  assert.ok(sitemap.includes(`<loc>${config.canonicalUrl}</loc>`));

const images = [];
await mkdir("artifacts", { recursive: true });
for (const [path, width, height] of [
  [
    new URL(pages[0].image).pathname + new URL(pages[0].image).search,
    1200,
    630,
  ],
  ["/icon", 64, 64],
  ["/apple-icon", 180, 180],
]) {
  // Use the checked server's origin even when canonical metadata points at a configured domain.
  const response = await fetch(new URL(path, base), { signal: timeout() });
  assert.equal(response.status, 200, `${path} must render`);
  assert.match(response.headers.get("content-type") || "", /image\/png/);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(bytes.readUInt32BE(16), width);
  assert.equal(bytes.readUInt32BE(20), height);
  assert.ok(bytes.length < 5 * 1024 * 1024);
  images.push({ path, width, height, bytes: bytes.length });
  if (width === 1200)
    await writeFile("artifacts/content-mark-social-card.png", bytes);
}
await writeFile(
  "artifacts/seo-check.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      base: base.origin,
      indexable: config.indexable,
      pages,
      routes: routeChecks,
      images,
      robots,
      sitemap,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `SEO checks passed: 7 public pages and their internal links, 4 crawler/browser responses, private-route metadata, real 404, robots, sitemap, and 3 PNG assets. Indexable: ${config.indexable}.`,
);
