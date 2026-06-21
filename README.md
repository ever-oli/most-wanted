# Most Wanted Packs

Concierge platform for small-batch, 2018 Farm Bill compliant premium hemp drops.

Built with **Vite + React + TypeScript + Tailwind/shadcn-ui** on the frontend and
**Convex** (reactive database + serverless functions) on the backend.

## Tech stack

- **Frontend:** Vite, React 18, TypeScript, React Router, TanStack Query
- **UI:** Tailwind CSS + shadcn-ui (Radix primitives)
- **Backend:** Convex — reactive DB + typed queries/mutations/actions (`convex/`)
- **Hosting:** GitHub Pages (frontend) + Convex Cloud (backend)

## Local development

Requires [Node.js](https://nodejs.org/) 18+ (or [Bun](https://bun.sh/)).

```sh
# install dependencies
npm install

# start the dev server (http://localhost:8080)
npm run dev
```

### Backend setup (Convex)

The first time you clone, link a Convex deployment. This generates
`convex/_generated/` (required for the build) and writes `VITE_CONVEX_URL` to
`.env.local`:

```sh
npx convex dev      # logs in, creates/links a deployment, runs codegen + live sync
```

Keep `npx convex dev` running alongside `npm run dev`. Then seed the jar/review
codes and set server secrets:

```sh
npx convex run seed:run                       # seed the HillTop Budz Farm jar codes
npx convex env set ADMIN_PASSPHRASE "<pick-a-strong-passphrase>"   # gates /intake
npx convex env set ORDER_WINDOW_MINUTES 30    # how long an unpaid order is reserved
npx convex env set ORDER_ALERT_WEBHOOK "<optional Discord/Telegram webhook>"
```

> `VITE_CONVEX_URL` is safe to commit/ship — it only identifies your public
> deployment. Secrets set via `convex env set` live server-side only and never
> reach the client bundle.

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

## Backend (Convex)

The `convex/` directory holds the schema and all backend logic:

- `schema.ts` — tables: `reviews`, `orderTokens`, `wantedListSignups`, `orders`
- `reviews.ts` — `list` (Archive feed), `validateCode`, `submit`
- `wantedList.ts` — `count`, `signup`
- `orders.ts` — `create` (action, pay-by-memo), `adminList` / `adminUpdate` (passphrase-gated)
- `seed.ts` — seeds the redeemable jar/review codes

Deploy the backend with:

```sh
npx convex deploy       # push functions + schema to your production deployment
```

The `/intake` route is the passphrase-gated fulfillment dashboard (set
`ADMIN_PASSPHRASE` via `convex env set`).

## License

Open source. See repository for details.
