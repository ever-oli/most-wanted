// ============= Drop configuration =============
// Adjust these values to reconfigure the drop without touching grid logic.
// This file is the SINGLE SOURCE OF TRUTH for drop content (see CLAUDE.md).

export type Tier = "EXCLUSIVE" | "EXO" | "AAA";

export interface TierConfig {
  id: Tier;
  label: string;
  price: number;
  weight: string;
  count: number; // number of squares of this tier on the grid
  maxPerOrder: number;
  description: string;
  colorClass: string; // bg-* utility (literal so Tailwind keeps it)
  textClass: string; // text-* utility
  borderClass: string; // border-* utility
}

export const GRID_SIZE = 10; // 10x10 = 100
export const TOTAL_SQUARES = GRID_SIZE * GRID_SIZE;

export const MAX_CART_TOTAL = 3;

/**
 * Wildcard pull price — the "one-armed bandit" model. Every pull always wins a
 * jar (so it's a mystery box, not regulated gambling); the gamble is which TIER
 * and STRAIN you land on. Average jar value is ~$87 at the default tier mix, so
 * this is set a touch above for house margin. Tune freely.
 */
export const WILDCARD_PRICE = 89;

/** Jars revealed per spin (fixed — three reels every pull). */
export const JARS_PER_PULL = 3;

/** Spins allowed per run. You then pick which of the dealt jars to buy. */
export const SPINS_PER_RUN = 4;

/** @deprecated The machine now pulls a fixed JARS_PER_PULL every spin. */
export const MAX_PER_PULL = JARS_PER_PULL;

/** Total jars dealt across a full run — the pool you pick your picks from. */
export const PULL_CART_MAX = JARS_PER_PULL * SPINS_PER_RUN;

/**
 * How long a pulled jar is HELD for you before it returns to the pool if you
 * haven't paid. Drives the per-jar countdown in the cart. NOTE: real
 * enforcement (returning stock) must happen server-side; the client timer is
 * UX only.
 */
export const RESERVATION_SECONDS = 180; // 3 minutes

/** Set to false to show a blurred preview with a "Coming Soon" overlay. */
export const DROP_LIVE = false;

/**
 * Recruitment mode: for the INITIAL drop only.
 * When true, the sealed vault shows a "Wanted List" recruitment panel
 * (tally toward RECRUITMENT_GOAL signups) instead of a countdown.
 * Flip to false once the goal is hit — countdown takes over for the actual drop.
 * After the initial drop, future drops use normal cadence (countdown only).
 */
export const RECRUITMENT_MODE = true;
export const RECRUITMENT_GOAL = 100;

/** Target date/time for the next drop. Used by the countdown on the sealed vault. */
export const NEXT_DROP_AT = new Date("2026-07-15T19:00:00-05:00");

/** Drop identity */
export const DROP_NAME = "HillTop Budz Farm";
export const DROP_SUBTITLE = "One man. A Houston grow.";

/**
 * drop_id used in the Supabase `order_tokens` / `reviews` tables and as the
 * fallback drop id on the review form. Keep in sync with the seed migration.
 */
export const DROP_ID = "hilltop-budz-farm";

/** Grower code — used to build jar/review codes: MW-<GROWER_CODE>-<STRAIN_CODE>-<NN> */
export const GROWER_CODE = "HBF";

/**
 * Which tier is the rarest "jackpot" cut. Drives the slot-machine jackpot
 * treatment so the celebration isn't hardcoded to a tier name.
 */
export const JACKPOT_TIER: Tier = "EXCLUSIVE";

/**
 * The strains in this drop. Each square in the Vault is a mystery jar of a
 * given TIER; the specific strain is the surprise. Jar/review codes are built
 * as MW-HBF-<code>-<NN> and the valid codes live in the Supabase
 * `order_tokens` table (the real source of truth for redemption).
 *
 * Strain data here matches the physical HillTop Budz Farm cards (source of
 * truth): codes, tiers, and spellings are taken directly from the cards.
 */
export interface StrainConfig {
  name: string;
  code: string;
  tier: Tier;
}

export const STRAINS: StrainConfig[] = [
  { name: "Tenderism OG", code: "TOG", tier: "EXCLUSIVE" }, // 7G F&F — the exclusive cut
  { name: "Platinum Lemon Cherry Gelato", code: "PLCG", tier: "EXO" },
  { name: "Crunch Berriez", code: "CB", tier: "EXO" },
  { name: "Super Boof", code: "SB", tier: "EXO" },
  { name: "Gelato 41", code: "G41", tier: "EXO" },
  { name: "Slapz", code: "SLP", tier: "EXO" },
  { name: "Honey Banana", code: "HB", tier: "AAA" },
  { name: "Lemon Cherry Gelato", code: "LCG", tier: "AAA" },
  { name: "Oreo Cake", code: "OC", tier: "AAA" },
  { name: "White Runtz", code: "WR", tier: "AAA" },
];

/**
 * Strain card art (the physical western labels), keyed by strain code. Files
 * live in `src/assets/strains/<CODE>.png`. The slot machine shows this art on
 * its reels, with a text fallback when a card is missing.
 */
const STRAIN_ART = import.meta.glob("@/assets/strains/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export function strainArt(code: string): string | undefined {
  const key = Object.keys(STRAIN_ART).find((p) => p.endsWith(`/${code}.png`));
  return key ? STRAIN_ART[key] : undefined;
}

/** Example batch code shown on the review form. */
export const FIRST_BATCH_CODE = `MW-${GROWER_CODE}-${STRAINS[0].code}-01`;

/** Golden squares - random position(s) that get bonus treatment */
export const GOLDEN_SQUARES = [42]; // Deterministic position for this drop

/** Wanted List clues - pre-drop hints, no photos */
export const WANTED_LIST_CLUES = [
  "One man. One Houston grow.",
  "Ten cuts on the sheet. One of them is exclusive.",
  "The exotics don't announce themselves.",
  "If you know, you know.",
  "Sealed until your door.",
];

export const TIERS: Record<Tier, TierConfig> = {
  EXCLUSIVE: {
    id: "EXCLUSIVE",
    label: "F&F",
    price: 110,
    weight: "7g jar",
    count: 8,
    maxPerOrder: 1,
    description: "Exclusive cut. The rarest on the sheet. One of one.",
    colorClass: "bg-tier-exclusive",
    textClass: "text-tier-exclusive",
    borderClass: "border-tier-exclusive",
  },
  EXO: {
    id: "EXO",
    label: "EXO",
    price: 100,
    weight: "7g jar",
    count: 52,
    maxPerOrder: 2,
    description: "Top-shelf concierge cultivar. Heavy hitters only.",
    colorClass: "bg-tier-exo",
    textClass: "text-tier-exo",
    borderClass: "border-tier-exo",
  },
  AAA: {
    id: "AAA",
    label: "AAA",
    price: 70,
    weight: "7g jar",
    count: 40,
    maxPerOrder: 2,
    description: "Premium small-batch flower from legacy operators.",
    colorClass: "bg-tier-aaa",
    textClass: "text-tier-aaa",
    borderClass: "border-tier-aaa",
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
    ...Array(TIERS.EXCLUSIVE.count).fill("EXCLUSIVE" as Tier),
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

/** All strains belonging to a given tier. */
export function strainsByTier(tier: Tier): StrainConfig[] {
  return STRAINS.filter((s) => s.tier === tier);
}

/**
 * Draw one random jar for a wildcard pull. Tier is weighted by each tier's
 * configured square count (the drop mix), then a random strain of that tier is
 * picked. NOTE: for real money this must move server-side so the draw is
 * authoritative and inventory-backed (no client-side rerolling).
 */
export function drawJar(): { tier: Tier; strain: StrainConfig } {
  const entries = Object.values(TIERS);
  const total = entries.reduce((s, t) => s + t.count, 0);
  let r = Math.random() * total;
  let tier: Tier = entries[0].id;
  for (const t of entries) {
    if (r < t.count) {
      tier = t.id;
      break;
    }
    r -= t.count;
  }
  const pool = strainsByTier(tier);
  const strain = pool[Math.floor(Math.random() * pool.length)];
  return { tier, strain };
}

// ====== Demo: pre-marked sold squares for FOMO realism ======
// Replace with real data from the backend later.
export const DEMO_SOLD_INDEXES: number[] = [
  3, 7, 12, 21, 28, 35, 41, 48, 55, 60, 68, 73, 81, 88, 94,
];
