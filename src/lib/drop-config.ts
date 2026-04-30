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

export const GRID_SIZE = 16; // 16x16 = 256
export const TOTAL_SQUARES = GRID_SIZE * GRID_SIZE;

export const MAX_CART_TOTAL = 3;

/** Set to false to show a blurred preview with a "Coming Soon" overlay. */
export const DROP_LIVE = false;

/**
 * Recruitment mode: for the INITIAL drop only.
 * When true, the sealed vault shows a "Wanted List" recruitment panel
 * (tally toward 256 signups) instead of a countdown.
 * Flip to false once 256 is hit — countdown takes over for the actual drop.
 * After the initial drop, future drops use normal cadence (countdown only).
 */
export const RECRUITMENT_MODE = true;
export const RECRUITMENT_GOAL = 256;

/** Target date/time for the next drop. Used by the countdown on the sealed vault. */
export const NEXT_DROP_AT = new Date("2026-05-15T19:00:00-04:00");

/** Drop identity */
export const DROP_NAME = "Red River Rivalry";
export const DROP_SUBTITLE = "Two growers. One border. The best of both sides.";

/** Operators - aliases and regions for story pages */
export const OPERATORS = [
  { alias: "The Dallas Architect", region: "North Texas" },
  { alias: "The OKC Ghost", region: "Moore, Oklahoma" },
];

/** Golden squares - 3 random positions that get bonus treatment */
export const GOLDEN_SQUARES = [42, 128, 201]; // Deterministic positions for this drop

/** Wanted List clues - pre-drop hints, no photos */
export const WANTED_LIST_CLUES = [
  "One side brings the heat from the metroplex concrete.",
  "The other side brings the quiet from the Oklahoma plains.",
  "The rivalry runs deeper than the Red River itself.",
  "Small batch. Two operators. No overlap.",
  "Sealed until your door."];

/** Drop story - the backstory that appears on private pages */
export const DROP_STORY = {
  title: "Red River Rivalry",
  body: `Two operators. One border. The Red River Rivalry drop brings together the best of both sides.

The Dallas Architect has been perfecting solventless extraction in the metroplex for years, pushing potency through precision. The OKC Ghost works the plains outside Moore, favoring patience over flash, letting the plant speak.

They do not agree on method. They agree on results.`,
  notes: "2018 Farm Bill compliant. Lab tested. Sealed fresh."
};

export const TIERS: Record<Tier, TierConfig> = {
  EXO: {
    id: "EXO",
    label: "EXO",
    price: 140,
    weight: "7g jar",
    count: 102,
    maxPerOrder: 2,
    description: "Top-shelf concierge cultivar. Heavy hitters only.",
    colorClass: "bg-tier-exo",
  },
  AAA: {
    id: "AAA",
    label: "AAA",
    price: 90,
    weight: "7g jar",
    count: 154,
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
  3, 17, 22, 41, 58, 64, 77, 89, 90, 102, 113, 121, 134, 145, 156, 167, 178, 199, 210, 233, 240, 248,
];
