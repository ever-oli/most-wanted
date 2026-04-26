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

export const TIERS: Record<Tier, TierConfig> = {
  EXO: {
    id: "EXO",
    label: "EXO",
    price: 100,
    weight: "7g",
    count: 102,
    maxPerOrder: 2,
    description: "Top-shelf concierge cultivar. Heavy hitters only.",
    colorClass: "bg-tier-exo",
  },
  AAA: {
    id: "AAA",
    label: "AAA",
    price: 65,
    weight: "7g",
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
