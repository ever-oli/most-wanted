# Most Wanted Packs

Concierge platform for small-batch, 2018 Farm Bill compliant premium hemp drops.

Built with **Vite + React + TypeScript + Tailwind/shadcn-ui** on the frontend and
**Supabase** (Postgres + Edge Functions) on the backend. Fully open source and
self-hostable — no proprietary platform required.

## Tech stack

- **Frontend:** Vite, React 18, TypeScript, React Router, TanStack Query
- **UI:** Tailwind CSS + shadcn-ui (Radix primitives)
- **Backend:** Supabase (hosted free tier) — Postgres, Auth, Edge Functions
- **Hosting:** GitHub Pages (free, deployed via GitHub Actions)

## Local development

Requires [Node.js](https://nodejs.org/) 18+ (or [Bun](https://bun.sh/)).

```sh
# install dependencies
npm install

# start the dev server (http://localhost:8080)
npm run dev
```

### Environment variables

The app reads its Supabase connection from environment variables. These are kept
in `.env`:

```sh
VITE_SUPABASE_URL="https://<your-project>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-anon-publishable-key>"
VITE_SUPABASE_PROJECT_ID="<your-project-id>"
```

> The publishable/anon key is **safe to commit** — it is meant to ship in the
> client bundle and is protected by Supabase Row Level Security policies. Never
> commit the `service_role` key.

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest test suite |

## Deployment (GitHub Pages)

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`).
Every push to `main` builds the site and publishes it to GitHub Pages.

**One-time setup:** In the repo, go to **Settings → Pages → Build and deployment**
and set the **Source** to **GitHub Actions**.

The site is served from `https://ever-oli.github.io/most-wanted/`. The Vite
`base` path is set to `/most-wanted/` to match. If you later add a custom domain,
set the `BASE_PATH` env var to `/` in the build and add a `public/CNAME` file.

### SPA routing note

GitHub Pages has no built-in single-page-app fallback, so the deploy workflow
copies `dist/index.html` to `dist/404.html`. This lets deep links (e.g.
`/review`, `/archive`) load correctly instead of 404ing.

## Backend (Supabase)

The `supabase/` directory contains the database migrations and Edge Functions
(`submit-review`, `wanted-list-signup`). The project currently runs against a
hosted Supabase project on the free tier. To run or manage the backend locally,
install the [Supabase CLI](https://supabase.com/docs/guides/cli):

```sh
supabase start          # run the full stack locally via Docker
supabase db push        # apply migrations to the linked project
supabase functions deploy <name>
```

## License

Open source. See repository for details.
