# Website development portfolio

The user supplied [Kevon Cadogan's portfolio](https://www.kevoncadogan.com/portfolio) as the source of past website work. All nine listed projects were imported, replacing the original three concept examples. The section credits website development to Kevon Cadogan. Project descriptions summarize website features without adding client results or performance claims.

| Project                         | Source detail page                                                          | Website                                               |
| ------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| Posh Home Decor                 | [Project](https://www.kevoncadogan.com/portfolio/poshhomedecor)             | [Website](https://www.poshhomedecorgy.com/)           |
| W&S Engineering                 | [Project](https://www.kevoncadogan.com/portfolio/wsengineering)             | [Website](https://www.wsengineeringgy.com/)           |
| Inner Alchemy Institution       | [Project](https://www.kevoncadogan.com/portfolio/inneralchemyinstitution)   | [Website](https://www.inneralchemyinstitution.com/)   |
| War On Retail Guyana            | [Project](https://www.kevoncadogan.com/portfolio/waronretailguyana)         | [Website](https://www.waronretailguyana.com/)         |
| Mista Concierge Travel          | [Project](https://www.kevoncadogan.com/portfolio/mistaconciergetravel)      | [Website](https://www.mistaconciergetravel.com/)      |
| Impact Business Solutions       | [Project](https://www.kevoncadogan.com/portfolio/impact-business-solutions) | [Website](https://www.impact-business-solutions.com/) |
| Healthyzway                     | [Project](https://www.kevoncadogan.com/portfolio/healthyzway)               | [Website](https://healthyzway.vercel.app/)            |
| Selena's Furniture Store Guyana | [Project](https://www.kevoncadogan.com/portfolio/selenafurniturestore)      | [Website](https://selenafurniturestore.com/)          |
| Bucketlist Caribbean            | [Project](https://www.kevoncadogan.com/portfolio/bucketlistcaribbean)       | [Website](https://www.bucketlistcaribbean.com/)       |

The source pages' 1200-pixel WebP preview images were copied into `public/portfolio/`. Source image names, in the same order, are `posh`, `wsengineering`, `inneralchemy`, `waronretail`, `mista`, `impact`, `healthyzway`, `selena`, and `bucketlistcaribbean`, under `https://www.kevoncadogan.com/img/portfolio/banner/optimized/{name}-1200.webp`. The site serves these local assets through Next.js image optimization and does not depend on remote image hotlinks. All nine live website links returned HTTP 200 when checked on October 28, 2026.

Project content lives in `src/data/portfolio.ts`. New local databases receive these projects through the normal seed. To apply the portfolio to an existing local Supabase database:

```sh
nvm use
npm run portfolio:import
```

The import takes an ignored owner-only backup in `.local/` and replaces only `projects` and `headings.work` in each document. Unrelated draft changes are preserved and remain unpublished. For Docker it verifies the project label and updates both records in one transaction. A hosted import requires an explicit `--target=<configured HTTPS Supabase origin>` argument; it uses the existing server-only key, revision/timestamp guards, and a guarded draft rollback if publication fails. Hosted writes are two API transactions. Rerunning against identical content does nothing. No Auth accounts, credentials, or permissions are changed. The currently configured hosted project was used for this import.

After import, manage project names, descriptions, order, website links, and replacement images through **Admin → Projects**. Imported local previews and authenticated uploads are both accepted by the CMS; arbitrary local file paths are rejected. Replacing an imported image uses the existing Supabase media upload flow. Publishing follows the existing draft workflow.
