# Content Mark Site Studio

The application now uses Supabase for password authentication, published content, private drafts, project media, and the inquiry inbox. The existing page is seeded as its initial content. No cloud Supabase project is required for this local setup.

## Open the workspace

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin
- Supabase Studio: http://127.0.0.1:54323
- Supabase API: http://127.0.0.1:54321
- Local Auth email viewer: http://127.0.0.1:54324

The local development account is `admin@contentmark.local`. Its generated password is stored in `.local/admin-credentials.json`, with owner-only filesystem permissions. That directory and `.env.local` are ignored by Git. This address is an internal development login, not a public business contact address.

## Start or resume local development

Use Node.js 24 (Node.js 22 or newer is required by the current Supabase client). Docker must be running.

```sh
nvm use
npm ci
npm run db:start
npm run db:env
npm exec supabase -- migration up --local
npm run db:seed
npm run admin:create
npm run dev
```

`db:start` starts the pinned Supabase CLI on a project-specific Docker network and explicitly verifies localhost-only port bindings. It preserves the services' generated configuration and named data volumes when rebinding ports. Only containers labeled for this project are managed. CLI connection keys are captured instead of printed. The helper is safe to rerun against an already-running local stack.

`db:env` saves this stack's connection variables and a random form-signing secret into `.env.local`, preserving unrelated variables. `db:seed` inserts the initial public document and draft only if they do not exist; it does not overwrite your edits. `admin:create` creates a local admin once and preserves an existing account/password on subsequent runs. Set `ADMIN_EMAIL` before running it if you want a different local account. These provisioning scripts deliberately refuse to operate against a non-local Supabase URL.

To stop the stack while keeping its data:

```sh
npm run db:stop
```

Stop the Next.js server with Ctrl+C in its terminal. Do not use `supabase stop --no-backup`, delete Docker volumes, or reset the database unless you intend to discard local data.

## Manage the website

- **Overview:** real inquiry counts, publication state, and quick links. No fabricated traffic or conversion metrics.
- **Page content:** hero copy, section introductions, service descriptions/features, advantages, and the four process steps.
- **Projects:** add, remove, reorder, and edit up to twelve project cards. Upload PNG, JPEG, or WebP images up to 5 MB, or keep the custom mockups. Concepts remain explicitly labeled until you change them to completed work. Website links are optional HTTPS URLs.
- **Pricing & offer:** edit the three packages, feature lists, management prices, and recommended package. Turn the founding offer on/off and edit its price, terms, features, and availability text.
- **FAQs:** add, remove, reorder, and edit questions and answers.
- **Settings:** search/social title and description, Facebook/Instagram URLs, WhatsApp number, footer description, and pricing disclaimer. Empty optional contact channels are hidden.
- **Inquiries:** search and filter the inbox, page through results, open full submissions, change status, and add private notes. Archive an inquiry to retain its record without treating it as active.

**Save draft** stores changes privately. **Preview draft** opens the saved version without changing the live page. **Publish changes** validates and atomically saves/publishes the current document. Public pages only read `site_content`; they cannot read `site_drafts`. Concurrent editor sessions use revision checks to prevent one save from silently overwriting another. Save before navigating away; unsaved edits are protected by a leave-page prompt. A draft preview requires an authenticated, approved admin session.

The public website is split into Home, Services, Our Process, Portfolio, Pricing, FAQs, and Contact. Existing content controls still edit those pages: hero and advantages appear on Home, and each section introduction controls the corresponding page heading and description. Preview opens the relevant page for the selected editor; preview navigation stays within `/admin/preview?page=…`, and inquiry submission is disabled in private previews. Publishing refreshes the full public site. Settings search title/description apply to the homepage; the remaining pages use distinct titles and their section introductions.

Project images are public website assets in the `site-media` bucket, including newly uploaded images before publication; draft copy and inquiry data remain private. Removing an image from a draft does not delete the asset, so older published content cannot break. There is no automatic media garbage collection.

## How inquiries work

The public contact handler validates the request, checks its origin, enforces the body limit, honeypot, signed timing token, and rate limit, then inserts a private `inquiries` row through a server-only Supabase key. Service/package validation uses the currently published content, so renamed packages still prefill and submit correctly.

With Supabase configured, **email credentials are optional**. A successful response means the inquiry was stored in the inbox. If Resend is configured, an additional notification is attempted and its status is stored as `sent` or `failed`. A failed notification never discards a saved inquiry or tells the visitor to submit a duplicate. Without Supabase, the original email-only integration remains supported.

Contact-form service-role credentials never enter the browser. Admin edits use the admin's own session and RLS, not the service key. Inquiry notes and status updates use optimistic timestamp checks to avoid lost changes. Email/WhatsApp links in the inbox open the relevant external application; the admin panel does not send replies automatically.

## Database and access controls

Tracked migrations live in `supabase/migrations/`. `supabase/schema.sql` is the readable original schema source; do not reapply it over an existing database. Future changes should use a new migration.

- RLS is enabled on every application table.
- `admin_users` is a membership allow-list. Authenticated users can read their own membership but cannot grant memberships through the public API.
- Public registration is disabled. Email/password sign-in is enabled for provisioned accounts.
- Public clients can read published content only. Ordinary signed-in users cannot access drafts, inquiry records, or uploads.
- The publishing function runs as `SECURITY INVOKER`, checks admin membership, locks the draft, and verifies its expected revision.
- Project uploads require an approved admin, validate image signatures, enforce a size/type limit, use generated filenames, and cannot overwrite existing objects.
- No secret/service key is prefixed `NEXT_PUBLIC_`.
- Admin/preview routes are dynamic, uncached, excluded from robots, and marked `noindex`.

## Verify

```sh
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
npm exec supabase -- db advisors --local --type security --level warn
```

The integration suite requires the local stack and `.local/admin-credentials.json`. It verifies public/non-admin denial, user-metadata escalation resistance, disabled signup, private drafts, stale-write rejection, inquiry persistence/search, and storage permissions. Temporary users, inquiries, and media are cleaned up. Its draft test restores the original published document and avoids touching an existing unpublished draft.

## Moving to hosted Supabase later

Apply the tracked migrations to your hosted project, provision an Auth user and its `admin_users` membership through a trusted administrative channel, then set the hosted `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SECRET_KEY`. Set `NEXT_PUBLIC_SITE_URL` to the actual HTTPS origin and keep `CONTACT_FORM_SECRET` stable. Configure Auth redirect URLs and keep public registration disabled. The local provisioning helpers intentionally do not create cloud admins or push remote schema changes.

Configure distributed rate limiting through the existing Upstash variables (or your hosting firewall) before serving public production traffic. The Docker stack here is for local development; it is not a public production Supabase deployment.

Implementation references: [Supabase SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [local development](https://supabase.com/docs/guides/local-development).
