# Responsive Typography QA — Fixes

## What I checked

Took screenshots at three viewports (375 mobile / 768 tablet / 1536 desktop) and walked through Hero, HashHoles, Ethos, Grading, How It Works, FAQ, WantedList, WantedListRecruitment, MysteryGrid. Most headings render cleanly. Three real issues to address, plus one polish pass for smoother scaling.

## Issues to fix

### 1. Hero tagline rotator clips on mobile (real bug)

`src/components/Hero.tsx` wraps the rotating tagline in a `<div className="h-6 overflow-hidden">`. At mobile font-size with `tracking-[0.35em]` and the dash glyphs, the line-height exceeds 24px and the bottom of the text (dashes/descenders) gets clipped. Visible as half-rendered "— LEGACY OPERATORS. —".

**Fix:** Change container to `min-h-[1.75rem] md:min-h-[1.5rem]` and drop `overflow-hidden` (it isn't needed — the animation only fades/translates a few px).

### 2. Hero H1 jumps too hard at the `md` breakpoint

Currently `text-4xl sm:text-5xl md:text-7xl`. At 768px tablet the jump to `text-7xl` forces an awkward 2-line wrap of "Welcome to Most Wanted Packs" with a heavy red glow. 

**Fix:** Insert intermediate step → `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`.

### 3. Section H2s jump from `text-3xl` to `text-5xl` with no tablet step

Files: `Ethos.tsx`, `GradingSystem.tsx`, `HowItWorks.tsx`, `FAQ.tsx`, `MysteryGrid.tsx`, `SocialFeeds.tsx`. Legible but blocky at ~768–900px.

**Fix:** Standardize to `text-3xl sm:text-4xl md:text-5xl` across these six section headings.

### 4. HashHolesDrop top pill hides under sticky AnchorNav

The "FEATURED DROP · WHILE SUPPLIES LAST" pill gets clipped by the sticky nav on mobile because the section root has no `scroll-mt` / top breathing room and is the first thing after Hero.

**Fix:** Add `pt-6 md:pt-10` (or `scroll-mt-24` if it has an id) to the section's outer container in `src/components/HashHolesDrop.tsx`.

## What I'm NOT changing

- FAQ accordions, How It Works cards, Wanted List, Grading System — render correctly at all sizes.
- The text-shadow glow on H1 — it's intentional brand styling, just smoothed by the new size step.
- The `MarqueeStrip` — renders fine on mobile (no action needed).
- Color, font family, letter-spacing — all on-brand.

## Files to edit

- `src/components/Hero.tsx` — tagline container height + H1 size step
- `src/components/HashHolesDrop.tsx` — section top padding
- `src/components/Ethos.tsx`
- `src/components/GradingSystem.tsx`
- `src/components/HowItWorks.tsx`
- `src/components/FAQ.tsx`
- `src/components/MysteryGrid.tsx`
- `src/components/SocialFeeds.tsx`

After edits I'll re-shoot mobile + tablet to confirm the tagline and H1 are clean.