# Content Mark search and sharing

## Production configuration

The final production domain has not been supplied. `NEXT_PUBLIC_SITE_URL` must be the actual HTTPS origin, without credentials, a path, query, or fragment. It is never inferred from request headers or an invented domain. When unset, local share-image URLs use `http://localhost:3000`; the page has no canonical/`og:url`, no business JSON-LD graph, and an empty sitemap.

The public page opts into indexing only when a public HTTPS origin is explicitly configured, `NODE_ENV=production`, and the deployment is not a Vercel preview/development environment. Local hosts/IPs and development builds stay `noindex`. Set `SITE_INDEXING_ENABLED=false` on other staging hosts. A value of `true` does not override the local/preview protections. Rebuild/redeploy after changing deployment variables, because Next.js response-header rules are built with the application.

Optional `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` accept the verification token alone, not a full meta tag. Verification, Search Console sitemap submission, and third-party sharing debugger requests have not been performed; those require your actual domain/account.

## Implemented behavior

- **Search copy:** the published admin Settings title and description drive the document title, description, Open Graph, Twitter cards, and WebPage structured data together. The editor includes length guidance without forcibly truncating your search copy.
- **Canonical:** a single absolute homepage URL, independent of inquiry-prefill or campaign query parameters. Private routes, errors, and unknown URLs do not inherit a homepage canonical. Choose the final apex/`www` hostname in your hosting provider and redirect any alternatives there; no unconfirmed host redirects are introduced in the application.
- **Sharing:** complete website type, site name, Guyana English locale, title, description, absolute image URL, PNG type, dimensions, and image alternative text. X/Twitter uses `summary_large_image` with the same card. No unverified social account handles or Facebook app IDs are emitted.
- **Share image:** `/opengraph-image` generates a 1200 × 630 PNG from the original Content Mark logo and the published hero headline. Draft text and URL query text are never rendered. The metadata URL includes the public content revision (`?v=…`), so a publication gives crawlers a new asset URL. Image responses cache for five minutes; social platforms maintain their own caches. Headline lines are fitted to the card. Browser and Apple touch icons use the supplied artwork.
- **Structured data:** one escaped JSON-LD graph links Organization, WebSite, WebPage, and the three visible Service entities. It uses the supplied logo, published social links, confirmed Guyana service area, and public inquiry section. WebPage modification time comes from the published record. No street address, phone, email, hours, reviews, ratings, results, founding date, or exact-price Product offers are invented. Organization is used instead of an address-dependent local-business rich-result claim. Private previews emit no JSON-LD. No search action is claimed because this site has no site search.
- **Crawler controls:** the production sitemap includes only the public canonical page. Its `lastmod` is the actual Supabase publication timestamp; without a database-backed publication timestamp it is omitted. Draft saves do not change it. No request-time fake modification dates, section fragments, query variants, or admin URLs are included.
- **Private/staging pages:** both metadata and `X-Robots-Tag` exclude admin pages and API responses. Non-public deployments also send an HTTP `noindex`. `robots.txt` allows page crawling so crawlers can read these directives, disallows `/api/`, and advertises the sitemap only for indexable production. Authentication continues to protect drafts and inquiries; robots directives are not access control.
- **Semantic markup:** one server-rendered H1, correctly separated headline phrases, English/Guyana language declarations, existing headings/landmarks/native FAQs, descriptive project-image alt text, and a branded, non-indexable real 404. Public content remains readable before JavaScript executes. The existing design is retained.

## Verify locally

With Docker/Supabase and the production Next.js server running:

```sh
nvm use
npm test
npm run typecheck
npm run lint
npm run build
npm start
# In another terminal:
npm run seo:check
```

`seo:check` requests HTML as Facebook, Twitter, Googlebot, and a normal browser. It verifies head metadata for limited HTML bots, canonical/query handling, private metadata isolation, 404 status, robots/sitemap output, and the actual PNG signatures/dimensions/sizes. It writes public-only evidence to `artifacts/seo-check.json` and `artifacts/content-mark-social-card.png`. Pass a server origin after `--` to test another running instance; use the matching deployment environment variables.

Before launch, set the real domain and optional verification tokens, rebuild, inspect the canonical and sitemap over HTTPS, validate the published JSON-LD with Google's Rich Results Test or Schema.org Validator, submit the sitemap in Search Console, and refresh a share preview with the platform's debugger. Search rankings, rich-result display, and third-party cache refresh timing are controlled by those platforms.

References: [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization), [noindex behavior](https://developers.google.com/search/docs/crawling-indexing/block-indexing), [sitemap modification dates](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Open Graph protocol](https://ogp.me/).
