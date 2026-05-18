// ============= Drop configuration =============
// Adjust these values to reconfigure the drop without touching grid logic.

export type Tier = "EXO" | "AAA";

export interface TierConfig {
  id: Tier;
  label: string;
  price: number;
  weight: string;
  count: number;
  maxPerOrder: number;
  description: string;
  colorClass: string;
}

export const GRID_SIZE = 8; // 8x8 = 64
export const TOTAL_SQUARES = GRID_SIZE * GRID_SIZE;

export const MAX_CART_TOTAL = 3;

/** Set to false to show a blurred preview with a "Coming Soon" overlay. */
export const DROP_LIVE = false;

/**
 * Recruitment mode: for the INITIAL drop only.
 * When true, the sealed vault shows a "Wanted List" recruitment panel
 * (tally toward 64 signups) instead of a countdown.
 * Flip to false once 64 is hit — countdown takes over for the actual drop.
 * After the initial drop, future drops use normal cadence (countdown only).
 */
export const RECRUITMENT_MODE = true;
export const RECRUITMENT_GOAL = 64;

/** Target date/time for the next drop. Used by the countdown on the sealed vault. */
export const NEXT_DROP_AT = new Date("2026-05-15T19:00:00-04:00");

/** Drop identity */
export const DROP_NAME = "Belgium";
export const DROP_SUBTITLE = "One man. NYC to Providence. Two ghosts you haven't met yet.";

/** Drop slug used in /drop/:dropId routes */
export const DROP_SLUG = "belgium";

/** Strain for this drop (EXO tier) */
export const STRAIN_NAME = "Oreo Cookies";
export const STRAIN_CODE = "OC";
export const GROWER_CODE = "BEL";
export const STRAIN_TIER: Tier = "EXO";

/** First official batch code — found on every jar card */
export const FIRST_BATCH_CODE = `MW-${STRAIN_CODE}-${GROWER_CODE}-01`;

/**
 * Valid jar codes now live in the backend `order_tokens` table (source of truth).
 * The Review form does a format check + backend pre-check — no client list to drift.
 */

/** Operators - aliases and regions for story pages. Two are intentionally redacted. */
export const OPERATORS = [
  { alias: "Belgium", region: "NYC / Providence", redacted: false },
  { alias: "███████", region: "Accomplice #1 — name withheld", redacted: true },
  { alias: "███████", region: "Accomplice #2 — name withheld", redacted: true },
];

/** Golden squares - 1 random position that gets bonus treatment */
export const GOLDEN_SQUARES = [42]; // Deterministic position for this drop

/** Wanted List clues - pre-drop hints, no photos */
export const WANTED_LIST_CLUES = [
  "He moves between the boroughs and the bay.",
  "They call him Belgium. He won't tell you why.",
  "Two more names on the sheet — both redacted.",
  "If you know, you know. The waffle is a coincidence.",
  "Sealed until your door.",
];

/** Drop story - the backstory that appears on private pages */
export const DROP_STORY = {
  title: "Belgium",
  body: `One man on the wanted list. Two more redacted.

Belgium runs between the five boroughs and the Providence bay. Quiet operator, loud results. Doesn't talk much about the work, doesn't talk at all about the name.

The other two? They haven't been named yet. Maybe next drop. Maybe never.

(No, there's no recipe. Stop asking.)`,
  notes: "2018 Farm Bill compliant. Lab tested. Sealed fresh."
};

export const TIERS: Record<Tier, TierConfig> = {
  EXO: {
    id: "EXO",
    label: "EXO",
    price: 110,
    weight: "7g jar",
    count: 26,
    maxPerOrder: 2,
    description: "Top-shelf concierge cultivar. Heavy hitters only.",
    colorClass: "bg-tier-exo",
  },
  AAA: {
    id: "AAA",
    label: "AAA",
    price: 75,
    weight: "7g jar",
    count: 38,
    maxPerOrder: 2,
    description: "Premium small-batch flower from legacy operators.",
    colorClass: "bg-tier-aaa",
  },
};

// Stable shuffle so the same drop layout persists between renders/sessions.
const SEED = 1337;
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Square {
  index: number;
  tier: Tier;
  sold: boolean;
}

export function buildGrid(soldIndexes: number[] = []): Square[] {
  const tiers: Tier[] = [
    ...Array(TIERS.EXO.count).fill("EXO" as Tier),
    ...Array(TIERS.AAA.count).fill("AAA" as Tier),
  ];
  const shuffled = seededShuffle(tiers, SEED);
  const soldSet = new Set(soldIndexes);
  return shuffled.map((tier, index) => ({
    index,
    tier,
    sold: soldSet.has(index),
  }));
}

// ====== Demo: pre-marked sold squares for FOMO realism ======
// Replace with real data from Shopify / backend later.
export const DEMO_SOLD_INDEXES: number[] = [
  3, 7, 12, 21, 28, 35, 41, 48, 55, 60,
];
