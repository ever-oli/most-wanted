# Closing the Loop: Reviews, Archive, and Identity

The review form already exists at `/review` but it's a dead-end — nothing persists. Here's how we close the experience loop without overbuilding.

## The Big Question First: Accounts?

Recommendation: **No accounts on day one. Lightweight order-bound identity instead.**

**Why no accounts now:**

- Friction kills first-drop conversion. Every account requirement = 20–30% drop-off.
- Your buyer already gave you their email + shipping at Shopify checkout. That IS their identity.
- You don't need a profile dashboard to ship a great experience — you need data and a public archive.

**The model instead — "Order Token":**
Every order gets a unique `review_token` printed on the jar card (e.g. `MW-RR-2A7K`). They go to `/review`, enter the token, rate the flower. One token = one review per square. Already aligned with your "batch code" UX.

**Reward layer (lightweight, no accounts):**

- Reviewers who submit get a **discount code emailed back** for the next drop (e.g. 10% off, hunter-only).
- Top-rated reviewers (by detail/depth) get **early access** to the next drop's Wanted List — we email them 24h before public.
- Future state: if/when accounts make sense, we already have email + review history keyed to it. Easy migration.

## What We Build

### 1. Backend: persist reviews

New table `reviews`:

- `id` uuid pk
- `order_token` text (e.g. `MW-RR-2A7K`) — required
- `square_index` int (which square, 0–63) — optional but encouraged
- `tier` text ('EXO' | 'AAA')
- `drop_id` text (e.g. `red-river-rivalry`)
- `nose`, `structure`, `cure`, `burn`, `experience` smallint (1–5)
- `average` numeric(3,2) — computed
- `notes` text
- `display_name` text (optional, e.g. alias they want shown publicly — "TX Hunter")
- `is_public` boolean default true
- `is_verified` boolean default false (we flip true once we match token to a real Shopify order)
- `created_at` timestamptz default now()

New table `order_tokens` (seeded by us when fulfilling orders):

- `token` text pk
- `drop_id` text
- `tier` text
- `square_index` int
- `email` text (the buyer)
- `redeemed_at` timestamptz null
- `created_at` timestamptz

RLS:

- `reviews`: anyone can SELECT where `is_public = true` (public archive). INSERT only via edge function.
- `order_tokens`: no public access — service role only.

### 2. Edge function `submit-review`

- Validates token exists and is unredeemed (or allow re-edit within 24h, configurable)
- Validates ratings (1–5), required fields, profanity-light scrub on notes
- Inserts review, marks token `redeemed_at`
- Optionally generates a one-time discount code via Shopify Admin API and emails it back (we already have `SHOPIFY_ACCESS_TOKEN`)
- Returns `{ success, archiveUrl }`

### 3. Wire `/review` page to the function

- Replace console.log with `supabase.functions.invoke('submit-review', ...)`
- Add optional "display name / alias" field
- Add checkbox: "Show my review publicly in the archive" (default checked)
- On success → redirect to `/archive#review-{id}` so they can see themselves listed

### 4. New page `/archive` — the public ledger

This is the allure-builder. Looks like a stamped index card wall.

- Lists every public review, newest first
- Filterable by drop, tier, score range
- Each card: alias, square #, tier, big average score (e.g. **4.6**), the 5-point breakdown bars, optional notes excerpt, date, "VERIFIED" stamp if `is_verified`
- Drop-level header showing aggregate: "RED RIVER RIVALRY · 47 hunters reviewed · avg 4.3 · top tier: EXO 4.6"
- Link from footer + new "ARCHIVE" entry in `AnchorNav`

### 5. Drop story / aggregate lives on

- On `/drop-story` (already exists), surface the aggregate ratings for that drop once reviews are in
- On the homepage `Ethos` or new "Track Record" strip: one rotating quote + the running site-wide average

### 6. Polish & loose ends

- AnchorNav: add "Archive" link
- Footer: link to `/review` (with tooltip "Have a jar? Rate it") and `/archive`
- The jar/print card needs the `order_token` printed on it — out of scope for code, but I'll note it in `SYSTEMS.md` so you don't forget when you do the print job
- Update `Index.tsx` "How It Works" copy to mention the rate → archive → reward loop

## What We're NOT Doing (yet)

- Full user accounts / profile pages
- Photo uploads on reviews (moderation is a rabbit hole — add later)
- Public reviewer leaderboards (can come once volume is real)
- On-site Shopify checkout integration — still mocked

## Files to Touch

- new migration: `reviews`, `order_tokens` tables + RLS
- new edge function: `supabase/functions/submit-review/index.ts`
- new page: `src/pages/Archive.tsx`
- edit: `src/pages/Review.tsx` (wire to backend, add alias + public toggle)
- edit: `src/App.tsx` (add `/archive` route)
- edit: `src/components/AnchorNav.tsx` (add Archive link)
- edit: `src/components/Footer.tsx` (Review + Archive links)
- edit: `src/components/HowItWorks.tsx` (mention the loop)
- edit: `SYSTEMS.md` (note about printing tokens on jar cards)

## Reward Mechanics (for your call)

Pick one to ship now:

1. **Discount code on submit** — 10% off next drop, single-use, expires when next drop closes. Easiest, highest impact.
2. **Early access list** — reviewers get emailed 24h before next Wanted List opens. Free to build, more "exclusive" feel.
3. **Both** — that's what I'd do. The discount is the carrot for casuals; early access is the carrot for the diehards.

If you want #1 or #3, I'll add the Shopify Admin discount-code generation to the edge function in this same pass.

---

Approve and tell me which reward path (1, 2, or 3) and I'll build it all in one go.  
  
build all in one go but lets work on the order token I like the MW in the front but MW-STRAIN-GROWER/DISTRO/BRAND. but lets do obvoisuly like the initials

&nbsp;