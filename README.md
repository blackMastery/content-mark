# Content Mark

The Supabase-backed admin panel, local Docker setup, login details, and publishing workflow are documented in [ADMIN.md](./ADMIN.md).

Search metadata, canonical URLs, indexing controls, share images, structured data, domain setup, and crawler verification are documented in [SEO.md](./SEO.md).

A complete, responsive agency website built with Next.js App Router, TypeScript, Tailwind CSS, Motion, Lucide, React Hook Form, and Zod. Custom hero mockups are inline SVG and CSS. The portfolio contains nine website projects from Kevon Cadogan's supplied portfolio, with local WebP previews and live website links. There are no invented outcomes or client testimonials. Sources and import details are in [PORTFOLIO.md](./PORTFOLIO.md).

The public site now has eight main pages: `/`, `/services`, `/process`, `/portfolio`, `/pricing`, `/faqs`, `/blog`, and `/contact`. The homepage gives a concise introduction; the existing detailed sections each have their own destination. Shared navigation, footer, page headings, breadcrumbs, and contact links work across pages. Old homepage section bookmarks are forwarded to the corresponding page in the browser. Admin drafts can be previewed page by page without publishing them.

The blog includes private article drafts, text/image/video blocks, saved previews, independent publication, and unpublishing. Manage it from `/admin/blog`; the public journal is `/blog`. See the blog workflow and media limits in [ADMIN.md](./ADMIN.md#blog-articles).

## Run locally

Requires Node.js 22 or later. Node.js 24 is selected by `.nvmrc` and `.node-version`. Run `nvm use` before installing or starting the application.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Google fonts are downloaded by Next.js at build time and served locally by the application. The first build requires access to Google's font service.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Tests cover inquiry validation, tampered/expired/too-fast form tokens, missing delivery configuration, provider failures, and successful provider acceptance. Delivery is only reported as successful after Resend returns a message ID. Actual inbox delivery depends on the provider and recipient mail server; no live email has been sent during development.

## Configure inquiries

1. Create a Resend API key and verify the business's sending domain in Resend.
2. Set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (a verified sender, optionally `Content Mark <verified-address>`), and `CONTACT_TO_EMAIL` (the actual recipient).
3. Set `CONTACT_FORM_SECRET` to a stable, randomly generated secret of at least 32 bytes. This is required for production. For example, generate one locally with `openssl rand -hex 32`; save it directly in your deployment's secrets.
4. Set `NEXT_PUBLIC_SITE_URL` to the final origin, such as your actual HTTPS business domain. It controls canonical URLs, social metadata, sitemap, robots, and the form's allowed origin. Do not leave this unset in production; localhost is only a development fallback. For a Vercel preview, use that preview's actual origin in its environment.
5. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to the actual business number including country code. Its CTA is hidden until configured; no number is assumed.
6. Optionally set `NEXT_PUBLIC_INSTAGRAM_URL` to the real profile. Facebook already uses the supplied business URL.

The endpoint is `POST /api/contact`; `GET /api/contact` issues a one-hour HMAC-signed timing token. Requests require the same origin, JSON, a body under 16 KB, validated fields, an empty honeypot, and at least three seconds since the token was issued. The user must refresh after an expired token. A rate limit allows five attempts per ten minutes, with hashed IP keys. Requests are not logged and inquiries are only forwarded to the configured mailbox. When Supabase is configured, inquiries are stored in the private admin inbox. Without Supabase, the original email-only delivery integration remains available.

For distributed production rate limiting, set both Upstash Redis REST variables. The implementation uses an atomic expiring counter and fails closed if that configured service is unavailable. Without Redis, limits are bounded to an individual warm server instance and reset on cold starts; configure Redis and/or Vercel Firewall for public production traffic. The timing token and honeypot reduce basic automated spam, but are not a CAPTCHA.

Without Supabase and without delivery credentials, valid submissions return an explicit 503 configuration error and direct visitors to the supplied Facebook link. No inquiry is stored or silently queued. With credentials present, provider errors/timeouts also show an honest failure message. Keep all credentials server-side; only the deliberately public `NEXT_PUBLIC_*` variables enter the browser bundle.

Resend integration reference: https://resend.com/docs/api-reference/emails/send-email

## Deploy to Vercel

Import this folder as a Next.js project. Use `npm run build` and the default Next.js output settings. Add the environment variables above in the Vercel project before deployment, then redeploy after changing any `NEXT_PUBLIC_*` value. Run the checks above and a real inquiry using your own contact details once credentials are installed. The repository is configured for Vercel; no hosting account or public deployment was created during development.

## Edit content and visuals

- `src/data/content.ts`: services, packages, process, FAQs.
- `src/data/portfolio.ts`: the nine website projects, live links, and portfolio introduction.
- `src/lib/constants.ts`: navigation, social link, service selection options.
- `src/app/globals.css`: brand tokens, typography, component styling, responsive breakpoints and reduced-motion handling.
- `src/components/ui/brand.tsx`: responsive display crops of the supplied official logo. The unchanged original artwork is kept in `public/brand/content-mark-logo.png`; the footer shows its full signature. Browser and social icons use the same artwork.
- `src/components/ui/mockups.tsx`: custom property, automotive and retail illustrations.
- `src/components/sections/`: independently editable sections.

Package CTAs use `/contact?package=Business+Growth` (or `/contact?service=Website+Development`) to prefill the contact service field, including when changing parameters through client navigation. Project previews use native accessible dialogs; the process uses arrow-key-accessible tabs; FAQs use native accordions; the mobile menu supports Escape and focus wrapping. A skip link, labeled fields, inline validation and live delivery feedback are included. Motion respects reduced-motion preferences.

Before publishing, verify the founding-client promotion is still available, confirm the ownership/maintenance terms in the FAQs match your project agreements, and add actual business contact details through the environment configuration. Keep the portfolio project details current through the admin panel. These are content/configuration checks, not implementation placeholders.
