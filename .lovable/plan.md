# The Rap Sheet — Keepsake & Review Driver

A folded paper dossier tucked inside every jar. Looks like an old-west criminal record for the strain. Doubles as the review prompt and the collectible artifact hunters archive.

## What goes on the Rap Sheet

**Front (cover, folded closed)**
- "WANTED" header in the outlaw font
- Strain name as the alias (e.g. *"GORILLA GLUE #4 — alias 'The Glue'"*)
- Mugshot-style illustration (drop-unique art per drop)
- Drop name + numbered edition: `RED RIVER RIVALRY · 014 / 100`

**Inside (unfolds)**
- **Rap Sheet:** lineage, terps, grower, harvest date, cure days
- **Field notes:** 2–3 lines of grower voice
- **The Verdict is Yours:** small QR + batch code (`MW-RRR-DA-2A7K`), microcopy "Rate this bounty. Earn 10% off the next hunt."

**Back**
- Sheriff star + "Property of the Most Wanted Archive"
- mostwantedhemp.co/archive

Same template every drop, art + numbering swap. Cheap to print, high narrative weight.

## Site changes

1. **New section on `/` — "The Rap Sheet"**
   - Lives between `HowItWorks` and `GradingSystem` (keeps the loop story tight: hunt → unbox → rate)
   - Headline: *"Every Jar Comes With A Record"*
   - Two-column on desktop / stacked on mobile:
     - Left: cleaned jar photo (Gemini watermark removed)
     - Right: a `PosterFrame`-wrapped mock of the rap sheet, showing the QR placeholder + batch code, with three bullets:
       - *Numbered & drop-unique* — only X printed, never reprinted
       - *Your batch, your record* — code on the sheet matches your jar
       - *Rate it, archive it* — scan to log your verdict, earn 10% off
   - CTA row: "See The Archive →" (`/archive`) and "Submit a Verdict →" (`/review`)

2. **Jar image cleanup**
   - Use `imagegen--edit_image` on the uploaded photo to remove the Gemini watermark in the bottom-right corner
   - Save to `src/assets/jars-most-wanted.jpg`

3. **Rap Sheet visual mock**
   - Generated illustration (`src/assets/rap-sheet-mock.png`) — folded paper with the layout above, on a dark background, premium quality so the typography reads
   - No real QR yet (placeholder square that says "SCAN")

4. **Anchor nav + Footer**
   - Add "Rap Sheet" link to `AnchorNav.tsx`
   - Footer already has Review + Archive — leave alone

5. **Copy touch-ups**
   - `HowItWorks` step 4 ("Rate & Reward") gets one line: *"Your jar ships with a numbered Rap Sheet — scan the code on it to log your verdict."*
   - `SYSTEMS.md` gets a new "Rap Sheet" subsection under the token format spec, documenting print specs (folded 3.5"×5", numbered 001–XXX per drop, QR points to `/review?token=…`).

6. **Pre-fill review token from QR**
   - Update `Review.tsx` to read `?token=` from the URL and pre-populate the batch code field. Tiny change, big UX win when they scan.

## Out of scope
- Actual print-ready PDF artwork (you'll commission that separately)
- Real QR generation per token (the edge function can mint a per-order URL later — not needed for the site mock)
- Sticker / second physical item — explicitly skipped per your call

## Files touched
- new: `src/components/RapSheet.tsx`
- new asset: `src/assets/jars-most-wanted.jpg` (cleaned upload)
- new asset: `src/assets/rap-sheet-mock.png` (generated)
- edit: `src/pages/Index.tsx` (mount section)
- edit: `src/components/AnchorNav.tsx` (nav link)
- edit: `src/components/HowItWorks.tsx` (one line)
- edit: `src/pages/Review.tsx` (read `?token=`)
- edit: `SYSTEMS.md` (print spec)
