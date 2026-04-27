# Ways To Level Up The Site (Single-Page Preserved)

The one-page scroll stays. Everything below either adds depth *within* the scroll or polishes what's already there. Pick any combo — each item is independent.

---

## 1. Sticky Anchor Nav (preserves single-page feel)

Thin bar under the promo banner with smooth-scroll links: **Ethos · Grading · How It Works · The Vault · Feed**. On mobile it collapses to a horizontal scroll strip. Highlights the active section as you scroll.

**Why:** Helps returning visitors jump to the grid without losing the scroll-story feel.

---

## 2. Countdown / Next Drop Timer

Since `DROP_LIVE = false`, replace the static "Coming Soon" card on the grid with a live countdown (days · hrs · min · sec) to the next drop. Also add a small "Notify Me" email capture (stored locally for now, wired to Lovable Cloud later if you want real notifications).

**Why:** Turns the dead-state vault into a FOMO hook instead of a wall.

---

## 3. FAQ Accordion Section

New section between **How It Works** and **The Vault**. 6–8 questions:
- What's actually in the pack?
- Is this legal in my state?
- Shipping times / discreet packaging?
- Refund policy on mystery drops?
- What's the difference between EXO and AAA?
- When's the next drop?
- How do I reach out for wholesale?

Uses the existing `accordion` shadcn component — fits the outlaw aesthetic with minimal styling work.

**Why:** Kills checkout hesitation and reduces DM load.

---

## 4. Testimonials / Press Strip

Horizontal marquee or 3-card grid under Ethos: quotes from operators, customer IG screenshots, or "as seen on" logos. Can start with 3 placeholder quotes you fill in.

**Why:** Social proof is missing entirely — big gap for a premium drop brand.

---

## 5. Grid UX Polish

- **Hover preview on desktop**: already partially there, but also show tier + price in a floating tooltip.
- **Keyboard nav**: arrow keys move focus across the grid, Enter reveals/locks.
- **"Reveal All" toggle**: optional switch for users who don't want the mystery-click mechanic.
- **Progress bar**: visible "X of 256 claimed" bar above the grid, not just in the legend.
- **Sold animation**: when a square is claimed, brief pulse + stamp animation.

---

## 6. Hero Enhancements

- **Animated tagline rotator** under the main headline ("Small-batch." → "Legacy operators." → "Sealed until your door.")
- **Scroll cue** (subtle bouncing chevron) so users know there's more below the fold.
- **Parallax grain layer** on the background for depth.

---

## 7. SEO & Social Sharing

- Title is currently `Most Wanted  — Concierge Hemp Drops` (double space). Clean up.
- Add `<link rel="canonical">`, `<meta name="robots">`, proper `og:url`, `og:site_name`.
- Add `favicon.ico` + apple-touch-icon (currently using default Lovable favicon).
- JSON-LD structured data for `Organization` + `Product` so Google shows rich results.

---

## 8. Performance & Accessibility

- Grid currently renders 256 buttons every render — memoize square components so only the tapped one re-renders.
- Add `prefers-reduced-motion` guard on the `animate-flicker` promo banner (can trigger migraines).
- Add focus rings on all interactive elements for keyboard users.
- Lazy-load the Curator social feed script (only when the section scrolls into view) — currently loads on mount, slowing first paint.

---

## 9. Footer Upgrade

Currently pretty sparse. Add:
- Quick links column (same anchors as the nav)
- Newsletter signup (single email input)
- Legal: Terms · Privacy · Shipping Policy · COA lookup
- Small "Made in [State]" or origin line for authenticity

---

## 10. Micro-interactions & Polish

- Toast styling: currently uses default sonner; skin it with outlaw red/tan.
- Cart bar: add a subtle slide-up animation (already has `animate-reveal`, but tune easing).
- Age gate: add a fade-out transition instead of instant removal.
- Cursor: custom crosshair cursor over the grid (optional, adds a lot of character).

---

## Recommended First Round

If you want a high-impact pass in one shot, I'd do: **1 (nav) + 2 (countdown) + 3 (FAQ) + 7 (SEO cleanup)**. That's the biggest perceived-quality jump without touching Shopify or the single-page structure.

Tell me which items you want (numbers are fine, e.g. "1, 2, 3, 7") and I'll build them.
