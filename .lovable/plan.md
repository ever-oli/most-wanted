# Polish Pass — Inspired by headyterppusher.com (single-page preserved)

After walking through the live site and HTP, here's what HTP does well that we can borrow without copying the look:

- **Cinematic illustrated background** behind the age gate (theirs is Calvin & Hobbes art) — sets a *world*, not a page.
- **Always-running marquee strip** under the header repeating their value prop ("Premium Legal Cannabis | Great Prices | Fast Service").
- **Playful, loose welcome card** with handwritten-feel headline instead of corporate "Age Verification".
- **Custom cursor** + tactile micro-interactions everywhere.
- **Strong product imagery** as the hero — they trust their packaging to do the work.

Our site already has the outlaw bones; we just need more *atmosphere* and *texture*. Below is what I'd ship — pick any subset.

---

## 1. Cinematic Age Gate (high impact)

Replace the current dim blurred background with a true scene:

- Full-bleed illustrated/photographic background behind the modal — think dusty saloon interior, desert highway at dusk, or a wanted-poster wall. Generated once, stored in `/public`.
- Heavy vignette + grain overlay so the modal still pops.
- Modal itself: looser, slightly off-axis (rotated `-1deg`) like a pinned-up poster, with torn-paper edges (SVG mask).
- Replace "I'M 21 — ENTER" / "EXIT" with stamp-style buttons: **"RIDE IN"** / **"TURN BACK"**.
- Fade-out already exists — keep it, add a brief "door opening" wipe.

## 2. Marquee Strip Under Promo Banner

Right under the red "FREE SHIPPING" banner, add a thin tan-on-black marquee:

```text
★ SMALL-BATCH DROPS  ★  SEALED UNTIL YOUR DOOR  ★  256 SQUARES, 256 OUTLAWS  ★  CONCIERGE TO THE FINEST  ★
```

Reuses the existing `animate-marquee` keyframe. Pauses on hover. Hidden when `prefers-reduced-motion`.

## 3. Custom Crosshair Cursor — Site-Wide (currently grid-only)

`cursor-crosshair-outlaw` already exists for the grid. Apply a softer variant globally on `html` and swap to a "lock" cursor on interactive elements (buttons, links). Big perceived-quality bump, ~10 lines of CSS.

## 4. Hero Atmosphere

- Add a **dust/ember particle layer** drifting upward behind the star logo (CSS-only, ~20 floating dots with random delays, `prefers-reduced-motion` guard).
- The animated tagline rotator from the original plan ("Small-batch." → "Legacy operators." → "Sealed until your door.") — already partially scaffolded in `index.css` (`animate-tagline-fade`), wire it up.
- Add a subtle **scroll cue** chevron at the bottom of the hero (`animate-scroll-cue` already exists).

## 5. Wanted-List Card — Reframe the Empty State

Currently the recruitment card sits *on top of* the locked grid which looks busy. Better:

- Move the recruitment card *above* the grid as its own framed section ("Recruiting Hunters: 0 / 256 signed on").
- Below it, the grid sits dimmed at ~40% opacity with a small "Vault locks when 256 sign on" caption — implies progression.
- Once 256 hit, grid lights up and countdown begins (already planned).

## 6. Wanted-Poster Frame Around the Grid

Wrap `.MysteryGrid` in an SVG-bordered frame styled like an old-west wanted poster — torn edges, faux-folds in the corners, "REWARD" stamp top-left. Pure decoration, no behavior change.

## 7. Section Dividers — Stamped

Replace the plain section gaps with thin stamped dividers (e.g., `★ ─────── ETHOS ─────── ★`) using `font-stamp`. Adds rhythm without adding scrolling sections.

## 8. Footer Upgrade (mentioned in old plan, still missing)

- Quick-link column matching anchor nav
- Newsletter signup (reuse the wanted-list edge function endpoint or add a separate `notify_me` table later)
- Legal line: Terms · Privacy · Shipping · COA Lookup
- "Made in [State] · Farm Bill compliant" stamp

## 9. SEO + Favicon Cleanup (still outstanding)

- Fix double-space in `<title>` in `index.html`
- Add `og:url`, `og:site_name`, canonical link
- Custom favicon (the wanted-star logo) replacing the default Lovable one
- JSON-LD `Organization` schema

## 10. Micro-polish

- Toast skinning is already there — add a tiny star icon prefix on success toasts.
- Promo banner currently sticky at top — keep, but add a 1px tan underline that pulses faintly when promo is "live".
- Cart bar slide easing tighten.

---

## Recommended first round

If you only want one merge: **1 (cinematic age gate) + 2 (marquee) + 3 (cursor) + 5 (wanted-list reframe)**. That's the biggest *atmosphere* jump and directly mirrors what makes HTP feel cinematic — without adding any new pages or breaking the scroll-story.

Tell me which numbers you want (e.g. "1, 2, 3, 5") and whether you want me to generate the age-gate background image (AI gen via Lovable AI) or use a CSS-only treatment.  
  
DO ALL TEN FUCK IT 

## Technical notes

- All work stays inside existing components — no routing changes.
- New animations all gated behind `prefers-reduced-motion` per existing pattern.
- Custom cursor: SVG data URI in CSS, no asset.
- Wanted-list reframe is a JSX reordering inside `Index.tsx` + tweaks to `MysteryGrid.tsx` (drop the embedded `<WantedListRecruitment/>`).
- Age gate background: if AI-generated, write to `public/age-gate-bg.webp` (~150KB target, lazy-loaded).
- No new dependencies.