# Camera-Ready Demo Run Plan

Goal: give your guy a polished, end-to-end run-through of the Most Wanted experience he can screen-record — landing, scrolling, hunting a square, "checking out," and a confirmation moment — without flipping the public site out of Recruitment Mode.

## The Setup

The public site stays exactly as it is today: `DROP_LIVE = false`, `RECRUITMENT_MODE = true`, Wanted List collecting signups. We add a hidden **Demo Mode** that only activates with a secret URL param so the recording looks like the real drop went live, but no one stumbling onto the site sees it.

Activated via: `?demo=1` (or a slightly obscured token like `?ride=1`). When active, it overrides the live/recruitment flags client-side only.

## What He'll Record (storyboard)

1. **Landing** — Age gate → promo banner → marquee → hero with rotating tagline. Pause on the hero "Hunt Begins" headline.
2. **Scroll-through** — Past Featured Drop, Ethos, Grading System, How It Works, FAQ. This sells the brand before the mechanic.
3. **The Vault unsealed** — Lands on the Mystery Grid. In demo mode it's unblurred and live. Some squares pre-marked SOLD for FOMO.
4. **The hunt** — Hover/tap reveal mechanic. Tap a square → tier reveal (EXO/AAA). Tap again → CheckoutSheet confirmation. Lock in 2–3 squares (mix tiers, ideally hit the golden square #42 for the bonus moment).
5. **Cart bar** — Bottom cart appears with selections. He clicks **Lock It In · $XXX**.
6. **Confirmation** — Instead of routing to a real Shopify checkout (which would require a real charge), demo mode shows a styled "Order Locked" success screen with his squares, total, and a "Sealed. Shipping soon." stamp. Looks legit on camera.
7. **Outro** — Scroll back up to the hero or cut to the Wanted List recruitment panel as the call-to-action for his viewers.

## What We Build

### 1. Demo Mode toggle (`src/lib/demo-mode.ts`)
- Reads `?demo=1` from URL on mount, stores in a small context/hook (`useDemoMode`).
- Exposes overrides: `dropLive`, `recruitmentMode`, plus a `demoCheckout` flag.
- Optional: subtle corner badge "DEMO" so we can tell it's on (hidden via second param `&clean=1` for the actual recording).

### 2. Mystery Grid wiring
- Replace direct `DROP_LIVE` / `RECRUITMENT_MODE` imports with `useDemoMode()` overrides.
- Same for `Index.tsx` (so the Recruitment section hides when demo is on and the grid unblurs).
- Pre-seeded SOLD indexes already exist (`DEMO_SOLD_INDEXES`) — keep as-is for FOMO realism.

### 3. Demo checkout flow
- New component `DemoCheckoutSuccess.tsx`: full-screen modal with poster-frame styling, a red "ORDER LOCKED" stamp, list of locked squares (#, tier, price), order total, fake order # (`MW-` + random), and "A confirmation has been sent" line.
- In `MysteryGrid.tsx`, the **Lock It In** button: if `demoCheckout` is true → open the success modal instead of the toast/Shopify route.
- Modal has a "Hunt Again" button that resets cart + revealed state so he can re-record takes without refreshing.

### 4. Polish for the camera
- Slow down the cart-slide-in animation a touch (currently snappy, reads better at 24fps).
- Make sure golden square #42's tooltip + glow are visible enough on screen recording.
- Confirm the hero tagline rotator timing feels intentional on a 15–30s pan.

## What He Needs From Us

- The secret URL: `https://most-wanted.lovable.app/?demo=1&clean=1`
- A 1-line script suggestion: "I'm gonna show y'all how this Most Wanted drop actually works…"
- Recommend: desktop screen recording at 1920x1080, OBS or QuickTime. Mobile take optional for a B-roll cut.
- Suggest he records 2 takes: one full slow walkthrough (90s) and one fast hunt-only (20s) for reels/shorts.

## Out of Scope (for this pass)

- Real Shopify checkout integration — staying mocked until the actual drop.
- Backend order persistence — demo orders are ephemeral.
- Video editing / overlays — that's on his side.

## Files to Touch

- new: `src/lib/demo-mode.ts`
- new: `src/components/DemoCheckoutSuccess.tsx`
- edit: `src/pages/Index.tsx` (use demo overrides)
- edit: `src/components/MysteryGrid.tsx` (use demo overrides + demo checkout path)
- edit: `src/index.css` (slight animation timing tweak, optional)

Approve this and I'll build it out so you can send him the link tonight.