# Belgium Drop + Interactive Sealed Vault

## 1. Strip & rename

**HashHolesDrop (Fidels promo)** — `src/components/HashHolesDrop.tsx`
- Remove the section entirely from `src/pages/Index.tsx` (keep the file for now, just unmount).
- Keep the Signal contact pattern (alias `ever.07`, QR, "Open Signal" link) and lift it into a smaller, reusable **`SignalContact`** component placed in the Footer area as the standing back-channel — no product imagery, no Fidels copy.

**Red River Rivalry** — purge across:
- `src/lib/drop-config.ts`: replace `DROP_NAME`, `DROP_SUBTITLE`, `OPERATORS`, `WANTED_LIST_CLUES`, `DROP_STORY` with the new Belgium lore (see §2).
- `src/pages/DropStory.tsx`: change route guard from `red-river-rivalry` to `belgium`.
- `src/components/RapSheet.tsx`: drop the `RED RIVER RIVALRY · 014/100` example to `BELGIUM · 014/100`.
- `SYSTEMS.md` + `.lovable/plan.md`: swap example tokens (`MW-RRR-…` → `MW-BEL-…`).

**AI strain photo** — remove `src/assets/jars-most-wanted.jpg` usage from `RapSheet.tsx` (and the file). The Rap Sheet section keeps the parchment mock + bullets; jar imagery comes back later when we have a real photo.

## 2. New drop: "Belgium" + mystery accomplices

```text
DROP_NAME      = "Belgium"
DROP_SUBTITLE  = "One man. NYC to Providence. Two ghosts you haven't met yet."
```

- **Operators:** `Belgium · NYC / RI` is the only named one. Add 2 placeholder slots: `??? · Accomplice #1`, `??? · Accomplice #2` — visually redacted (black-bar treatment) on `DropStory`.
- **Wanted List clues** (semi-cryptic, leaning into the waffle/Belgian lore as flavor, not a real recipe):
  1. "He moves between the boroughs and the bay."
  2. "They call him Belgium. He won't tell you why."
  3. "Two more names on the sheet — both redacted."
  4. "If you know, you know. The waffle is a coincidence."
  5. "Sealed until your door."
- **Waffle recipe:** **reference only**, never printed. One throwaway line on `DropStory` ("No, there's no recipe. Stop asking.") — that's the whole joke.

## 3. Sealed-vault interactivity (all 4, layered)

Goal: the locked grid stops being a static tease and starts teaching + collecting intent.

**A. First-visit walkthrough overlay** — new `src/components/VaultTour.tsx`
- 3 coachmarks anchored to the grid: (1) "Each square = one sealed jar", (2) "Hover to peek the tier", (3) "Tap to claim your spot on the Wanted List".
- Stored in `localStorage` (`mw_vault_tour_seen`). Skip button + auto-dismiss on outside click.

**B. Hover/click preview (sealed)** — `src/components/MysteryGrid.tsx`
- Pre-drop, hovering a square reveals tier badge (EXO/AAA) + price + "locks at drop" microcopy in a small floating chip. No buy action.
- Mobile: tap once to preview, tap again to reserve (B → C).

**C. Tap-to-reserve interest** — wires into existing `WantedListRecruitment` + `wanted-list-signup` edge function
- Tapping a square (after preview state) opens a tiny inline form: email + optional phone (SMS).
- On submit, marks the square with a faint "👁 watched" overlay and increments the recruitment counter toward 64.
- Reuses the existing edge function; add a `square_index` column to whatever table backs it (migration scope: 1 column, nullable).

**D. Live activity ticker** — new `src/components/VaultTicker.tsx`
- Strip above/below the grid: `> square 14 just got eyed · 41 of 64 spots watched · 23 hunters online`.
- Real watched-count from the recruitment table; "hunters online" is a tasteful synthetic counter (drifts in a believable range, not faked sales).

```text
┌──────────────────────────────────────────────┐
│  > square 14 eyed · 41/64 watched · 23 live  │ ← VaultTicker
├──────────────────────────────────────────────┤
│ [grid]  hover → tier chip                    │
│         tap   → reserve form                 │
│         first visit → VaultTour coachmarks   │
└──────────────────────────────────────────────┘
```

## 4. Justfeats-inspired polish (visual + business)

**Visual**
- Tighter product/tier cards in `MysteryGrid` legend + `Ethos`: less padding, larger numerals, stronger red accents. Matches the Supreme-store DNA you want to lean into.
- New **operator marquee** under the Hero: `BELGIUM · ??? · ??? · NYC · PROVIDENCE · BELGIUM ·` — same pattern as justfeats' `TENCO·PALATE·NOBOOF` row. Reuse `MarqueeStrip.tsx` with new content.

**Business cues (additive, not replacing tier model)**
- Add an **anchor bundle hint** to `PromoBanner` / `Ethos`: "3-jar haul → free priority shipping" (mirrors justfeats' bulk angle without adding a new SKU).
- **SMS tracking** mention: line on `HowItWorks` step 3 ("Tracking pings your phone the second it ships") and a checkbox on the reserve form (§3C).
- Strengthen the **21+ gate** copy in `AgeGate` to match the no-nonsense justfeats tone.

## 5. Files touched

```text
remove from page  src/pages/Index.tsx (drop <HashHolesDrop/>)
new               src/components/SignalContact.tsx
new               src/components/VaultTour.tsx
new               src/components/VaultTicker.tsx
edit              src/lib/drop-config.ts        (Belgium lore + clues + operators)
edit              src/pages/DropStory.tsx       (route id, redacted accomplices, waffle gag)
edit              src/components/MysteryGrid.tsx (hover preview + tap-to-reserve)
edit              src/components/RapSheet.tsx   (token example, drop jar image)
edit              src/components/MarqueeStrip.tsx (operator marquee)
edit              src/components/PromoBanner.tsx + Ethos.tsx (bundle hint)
edit              src/components/HowItWorks.tsx (SMS tracking line)
edit              src/components/AgeGate.tsx    (tighter 21+ copy)
edit              src/components/Footer.tsx     (mount SignalContact)
delete            src/assets/jars-most-wanted.jpg
edit              SYSTEMS.md, .lovable/plan.md  (token examples)
migration         add nullable square_index to recruitment signups table
```

## Out of scope

- Real photos of the new drop (placeholder/no jar image until you supply one).
- Actual Belgian waffle recipe (gag only).
- Naming the two accomplices (stays redacted this drop).
- New SKUs / Shopify changes — bundle hint is copy-only for now.
