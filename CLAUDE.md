# CLAUDE.md — Rules for working on Most Wanted

This file is the rulebook for anyone (human or AI) editing this repo. Read it
before making changes. For deep domain/architecture detail, see `SYSTEMS.md`.

---

## 0. The golden rule: EDIT, don't DUPLICATE

This is the #1 rule. Past tools broke the site by **creating new pages/components
instead of editing the existing ones.** Do not do this.

- There is **ONE main page**: `src/pages/Index.tsx`. All homepage content lives
  here as sections. To change the homepage, edit `Index.tsx` and the components
  it already imports — **never create a second homepage, landing page, or route.**
- There is **ONE store**: the "Vault" — `src/components/MysteryGrid.tsx` plus the
  checkout sheets (`CheckoutSheet.tsx`, `ReserveSquareSheet.tsx`). The store is a
  **section inside the main page**, not a separate page. To change the store, edit
  these components — never build a parallel store.
- Before adding any file, **search for an existing one that does the job** and edit
  that instead. Only create a new component if nothing comparable exists, and wire
  it into the existing page/section — don't fork the page.
- Do not add new routes unless the user explicitly asks for a genuinely new page.

If you think something truly needs a new page or route, **stop and ask the user first.**

---

## 1. How the site is structured

### Routes (the only real pages) — defined in `src/App.tsx`
| URL | File | Purpose |
|---|---|---|
| `/` | `src/pages/Index.tsx` | **Main page** — hero, ethos, grading, how-it-works, rap sheet, FAQ, wanted list, **and the store (Vault)** |
| `/review` | `src/pages/Review.tsx` | Submit a review using a jar code |
| `/archive` | `src/pages/Archive.tsx` | Past drops |
| `*` | `src/pages/NotFound.tsx` | 404 |

The top nav links (`#ethos`, `#grading`, `#vault`, `#feed`, …) are **anchor links
that scroll to sections on the main page** — they are NOT separate pages. Section
nav lives in `src/components/AnchorNav.tsx`.

### `src/lib/drop-config.ts` is the single source of truth for drop content
Drop name, subtitle, strain name/code, grower code, prices, tiers, dates,
recruitment mode, and operator stories all live here. **Change drop content here,
not hardcoded inside components.** Each drop = one cultivator/brand:
- `GROWER_CODE` (e.g. `BEL` for Belgium, `HBF` for HillTop Budz Farm)
- `STRAIN_CODE` (e.g. `OC` for Oreo Cake)
- Jar/review codes are built as `MW-<GROWER_CODE>-<STRAIN_CODE>-<NN>` (grower
  then strain, e.g. `MW-HBF-CB-01`) and the valid codes live in the Supabase
  `order_tokens` table (the real source of truth for redemption — see
  `supabase/migrations/`).
- `DROP_LIVE` toggles the live store vs. a "coming soon" preview.
- `RECRUITMENT_MODE` shows the Wanted List signup instead of a countdown.

### Tech stack
Vite + React 18 + TypeScript, Tailwind + shadcn-ui (Radix), React Router,
TanStack Query. Backend: Supabase (Postgres + Edge Functions in `supabase/`).
Path alias: `@/` → `src/`.

---

## 2. Brand, voice & compliance

### Visual identity — "outlaw / wanted poster"
- **Theme:** near-black background (`--background` 4% black), outlaw **red**
  primary (~`#D32F2F`), **tan** accents. Defined in `src/index.css` +
  `tailwind.config.ts`. Use the existing CSS tokens/utility classes
  (`font-outlaw`, `font-stamp`, `shadow-outlaw`, etc.) — don't invent new colors.
- **Fonts:** `Rye` (display, via `.font-outlaw`), `Special Elite` (stamp/mono,
  via `.font-stamp`), `Inter` (body). Don't add new font families.
- Keep the western/noir/"most wanted" aesthetic consistent across any new UI.

### Voice & copy
- Terse, cinematic, noir-outlaw. Short declarative lines.
  (e.g. "Secure your square. Rip the pack." / "Quiet operator, loud results.")
- Don't write generic marketing fluff or change the tone to corporate.

### Compliance (do NOT weaken these without explicit user direction)
- **21+ age gate** (`src/components/AgeGate.tsx`) must remain on first visit.
- All products are **2018 Farm Bill compliant hemp** — keep the compliance line
  in the footer. Legal entity: **Most Wanted LLC**.
- **No medical/health claims.** Don't add language implying the product treats,
  cures, or provides health benefits.
- Keep any age/jurisdiction confirmation copy intact.

---

## 3. Dev & deploy workflow

### Local development
```sh
npm install      # install deps (Node 18+; bun also works)
npm run dev      # dev server at http://localhost:8080
npm run build    # production build -> dist/
npm run preview  # preview the production build
npm run lint     # ESLint
npm run test     # Vitest (includes a smoke test that mounts the whole app)
```
- Supabase connection comes from `.env` (`VITE_SUPABASE_*`). The publishable/anon
  key is safe to commit (protected by Row Level Security). **Never commit the
  Supabase `service_role` key.**

### Deploy — GitHub Pages (automatic)
- **Every push to `main` auto-deploys** via `.github/workflows/deploy.yml` →
  live at **https://ever-oli.github.io/most-wanted/**. No manual steps.
- The site is served from the `/most-wanted/` base path (set in `vite.config.ts`).
  Asset/router paths depend on this — if you ever move to a custom domain, set
  `BASE_PATH=/` in the build and add `public/CNAME`. Don't hardcode absolute
  `/asset` paths in components; import assets or use the configured base.
- Run `npm run build` and `npm run test` before pushing to catch breakage early.

### Working agreement
- **Ask before** large refactors, new pages/routes, schema/migration changes, or
  anything that changes how money/checkout works.
- Make minimal, targeted edits that match the surrounding code style.
