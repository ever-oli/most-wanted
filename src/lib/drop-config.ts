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
 * and STRAIN you land on. Average jar value is ~$83 at the default tier mix, so
 * this is set a touch above for house margin. Tune freely.
 */
export const WILDCARD_PRICE = 85;

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

/**
 * Interim manual-payment config (used until a card processor + bank are set up).
 * Orders are placed pending payment; the buyer sends the total to one of these
 * handles with their order code in the memo. Edit these with your real handles.
 */
export const PAYMENT = {
  /** Your CashApp $cashtag, e.g. "$mostwanted". */
  cashappTag: "$everoli",
  /** Your Chime $ChimeSign, e.g. "$YourName". */
  chimeHandle: "$Everardo-Olivares-2",
  /** Minutes an unpaid order is held before it expires. */
  windowMinutes: 30,
};

/**
 * Discreet aliases — keep anything payment/processor-facing reading like a
 * dessert order, never cannabis. The customer still sees real strain names on
 * the site; aliases are for memos, receipts, and the bank's eyes. Keyed by code.
 */
export const STRAIN_ALIAS: Record<string, string> = {
  TOG: "House Special",
  PLCG: "Platinum Gelato",
  CB: "Berry Crunch",
  SB: "Cream Soda",
  G41: "Gelato No. 41",
  SLP: "Sour Candy",
  HB: "Banana Bread",
  LCG: "Cherry Gelato",
  OC: "Oreo Cake",
  WR: "Vanilla Ice Cream",
};

export function strainAlias(code: string): string {
  return STRAIN_ALIAS[code] ?? "House Special";
}

/** Set to false to show a blurred preview with a "Coming Soon" overlay. */
export const DROP_LIVE = true;

/**
 * Recruitment mode: for the INITIAL drop only.
 * When true, the sealed vault shows a "Wanted List" recruitment panel
 * (tally toward RECRUITMENT_GOAL signups) instead of a countdown.
 * Flip to false once the goal is hit — countdown takes over for the actual drop.
 * After the initial drop, future drops use normal cadence (countdown only).
 */
export const RECRUITMENT_MODE = false;
export const RECRUITMENT_GOAL = 100;

/** Target date/time for the next drop. Used by the countdown on the sealed vault. */
export const NEXT_DROP_AT = new Date("2026-07-15T19:00:00-05:00");

/** Drop identity */
export const DROP_NAME = "HillTop Budz Farm";
export const DROP_SUBTITLE = "One man. A Houston grow.";

/**
 * drop_id used in the Convex `orderTokens` / `reviews` tables and as the
 * fallback drop id on the review form. Keep in sync with convex/seed.ts.
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
 * as MW-HBF-<code>-<NN> and the valid codes live in the Convex
 * `orderTokens` table (the real source of truth for redemption).
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
  { name: "Tenderism OG", code: "TOG", tier: "EXCLUSIVE" }, // 7G Reserve — the exclusive cut
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

/**
 * Curated "dossier" notes for the strain lineup — keyed by strain code. This is
 * COMPLIANCE-SAFE reference only: type (Indica/Sativa/Hybrid), lineage/genetics,
 * flavor & aroma notes, and a short cinematic vibe blurb. NO medical/health
 * claims — never describe effects, conditions, or benefits here (see CLAUDE.md).
 * Lineage/type/flavor sourced from public strain references (Leafly et al.).
 */
export interface StrainDossier {
  /** Indica / Sativa / Hybrid descriptor (no effect language). */
  type: string;
  /** Genetics / cross. */
  lineage: string;
  /** Flavor & aroma / terpene notes — rendered as chips. */
  flavors: string[];
  /** Short noir blurb — flavor, lineage, reputation, look. No effect claims. */
  blurb: string;
  /** Leafly strain page; omit for the house exclusive (no public file). */
  leafly?: string;
}

export const STRAIN_DOSSIER: Record<string, StrainDossier> = {
  TOG: {
    type: "Indica-dominant Hybrid",
    lineage: "Jealousy × Meat Breath",
    flavors: ["Gas", "Funk", "Sweet", "Earth", "Cookie"],
    blurb:
      "The Reserve cut. Jealousy's loud, gassy sweetness folded into Meat Breath's savory funk — exotic on the nose, heavy in the cure. Land it on the reels and the jackpot lights up.",
    leafly: "https://www.leafly.com/search?q=Jealousy%20x%20Meat%20Breath",
  },
  PLCG: {
    type: "Indica-dominant Hybrid",
    lineage: "Sunset Sherbet × GSC — the Platinum cut",
    flavors: ["Lemon", "Cherry", "Citrus", "Cream", "Sweet"],
    blurb:
      "The platinum cut of a Cali legend. Lemon and cherry over cold cream — dressed up, polished, and twice as quiet about it.",
    leafly: "https://www.leafly.com/search?q=Platinum%20Lemon%20Cherry%20Gelato",
  },
  CB: {
    type: "Indica-leaning Hybrid",
    lineage: "(Gassius Clay × Billy Kimber) × Sweet Retreat",
    flavors: ["Berry cereal", "Candy", "Cream", "Gas", "Fruit"],
    blurb:
      "Half a decade of breeding folded into a cereal box. Smells like the bowl you weren't allowed seconds of — berry candy, then gas.",
    leafly: "https://www.leafly.com/search?q=Crunch%20Berriez",
  },
  SB: {
    type: "Balanced Hybrid",
    lineage: "Black Cherry Punch × Tropicana Cookies",
    flavors: ["Orange", "Cherry", "Citrus", "Diesel", "Cookie"],
    blurb:
      "Leafly's Strain of the Year, 2024. Loud orange off the Tropicana side, dark cherry off the Punch. A modern classic that earned the name the hard way.",
    leafly: "https://www.leafly.com/strains/super-boof",
  },
  G41: {
    type: "Hybrid",
    lineage: "Sunset Sherbet × Thin Mint GSC — Cookies Fam",
    flavors: ["Sweet cream", "Dessert", "Lavender", "Pine", "Citrus"],
    blurb:
      "Cookies-family royalty — the number every other Gelato gets measured against. Sweet cream with a whisper of lavender and pine.",
    leafly: "https://www.leafly.com/strains/gelato-41",
  },
  SLP: {
    type: "Indica-dominant Hybrid",
    lineage: "Runtz × Grease Monkey — Exotic Genetix",
    flavors: ["Skunk", "Diesel", "Pine", "Candy", "Citrus"],
    blurb:
      "Runtz dragged through the fuel pump by Grease Monkey. Candy up front, gas on the back, frosted all the way through. Named for the sound it makes.",
    leafly: "https://www.leafly.com/strains/slapz",
  },
  HB: {
    type: "Indica-leaning Hybrid",
    lineage: "Honey Boo Boo × Banana OG",
    flavors: ["Banana", "Honey", "Tropical", "Earth", "Gas"],
    blurb:
      "Ripe banana over warm honey, sticky to the touch. A dessert cut that wears its name on the nose.",
    leafly: "https://www.leafly.com/search?q=Honey%20Banana",
  },
  LCG: {
    type: "Indica-dominant Hybrid",
    lineage: "Sunset Sherbet × GSC — Backpackboyz cut",
    flavors: ["Lemon", "Cherry", "Citrus", "Berry", "Cream"],
    blurb:
      "The strain that built a brand on flavor alone. Lemon, cherry, and cream — the Bay Area's worst-kept secret.",
    leafly: "https://www.leafly.com/strains/lemon-cherry-gelato",
  },
  OC: {
    type: "Indica-dominant Hybrid",
    lineage: "Cookies & Cream × Secret Weapon (aka Oreoz)",
    flavors: ["Chocolate", "Vanilla", "Marshmallow", "Cream", "Gas"],
    blurb:
      "Near-black buds under a coat of frost. Chocolate and toasted marshmallow over diesel — a campfire dessert with a record.",
    leafly: "https://www.leafly.com/strains/oreoz",
  },
  WR: {
    type: "Balanced Hybrid",
    lineage: "Gelato × Zkittlez — the white pheno of Runtz",
    flavors: ["Sweet candy", "Tropical fruit", "Citrus", "Cream"],
    blurb:
      "Buds so frosted they read white. Gelato crossed with Zkittlez — pure candy, snow-tipped, top of the Runtz family tree.",
    leafly: "https://www.leafly.com/strains/white-runtz",
  },
};

export function strainDossier(code: string): StrainDossier | undefined {
  return STRAIN_DOSSIER[code];
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
    label: "Reserve",
    price: 100,
    weight: "7g jar",
    count: 8,
    maxPerOrder: 1,
    description: "Reserve — the rarest cut on the sheet, one of one.",
    colorClass: "bg-tier-exclusive",
    textClass: "text-tier-exclusive",
    borderClass: "border-tier-exclusive",
  },
  EXO: {
    id: "EXO",
    label: "EXO",
    price: 90,
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
export function drawJar(available?: Set<string>): { tier: Tier; strain: StrainConfig } {
  const isAvail = (s: StrainConfig) => !available || available.has(s.code);
  // Only weight tiers that still have an in-stock strain.
  const entries = Object.values(TIERS).filter((t) => STRAINS.some((s) => s.tier === t.id && isAvail(s)));
  const tierPool = entries.length ? entries : Object.values(TIERS);
  const total = tierPool.reduce((s, t) => s + t.count, 0);
  let r = Math.random() * total;
  let tier: Tier = tierPool[0].id;
  for (const t of tierPool) {
    if (r < t.count) {
      tier = t.id;
      break;
    }
    r -= t.count;
  }
  let pool = strainsByTier(tier).filter(isAvail);
  if (pool.length === 0) pool = strainsByTier(tier);
  const strain = pool[Math.floor(Math.random() * pool.length)];
  return { tier, strain };
}

// Real sold state comes from Convex inventory (convex/inventory.ts `summary`).
// No fabricated "sold" markers ship — kept empty intentionally.
export const DEMO_SOLD_INDEXES: number[] = [];
