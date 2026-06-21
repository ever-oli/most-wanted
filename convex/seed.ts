import { mutation } from "./_generated/server";

// First jar/review code per strain for the HillTop Budz Farm drop.
// Code format: MW-HBF-<STRAIN_CODE>-<NN> (grower then strain, matching the cards).
// Add more rows (…-02, -03) as physical jars are printed. Run with:
//   npx convex run seed:run
const DROP_ID = "hilltop-budz-farm";
const JARS_PER_STRAIN = 129;

type Tier = "EXCLUSIVE" | "EXO" | "AAA";
const STRAINS: { code: string; name: string; tier: Tier }[] = [
  { code: "TOG", name: "Tenderism OG", tier: "EXCLUSIVE" },
  { code: "PLCG", name: "Platinum Lemon Cherry Gelato", tier: "EXO" },
  { code: "CB", name: "Crunch Berriez", tier: "EXO" },
  { code: "SB", name: "Super Boof", tier: "EXO" },
  { code: "G41", name: "Gelato 41", tier: "EXO" },
  { code: "SLP", name: "Slapz", tier: "EXO" },
  { code: "HB", name: "Honey Banana", tier: "AAA" },
  { code: "LCG", name: "Lemon Cherry Gelato", tier: "AAA" },
  { code: "OC", name: "Oreo Cake", tier: "AAA" },
  { code: "WR", name: "White Runtz", tier: "AAA" },
];

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    let tokensAdded = 0;
    let inventoryAdded = 0;

    for (const s of STRAINS) {
      // Jar/review code (source of truth for redemption).
      const token = `MW-HBF-${s.code}-01`;
      const existingToken = await ctx.db
        .query("orderTokens")
        .withIndex("by_token", (q) => q.eq("token", token))
        .unique();
      if (!existingToken) {
        await ctx.db.insert("orderTokens", { token, dropId: DROP_ID, tier: s.tier, squareIndex: null });
        tokensAdded++;
      }

      // Stock row (idempotent — leaves existing committed counts alone).
      const existingInv = await ctx.db
        .query("inventory")
        .withIndex("by_code", (q) => q.eq("code", s.code))
        .unique();
      if (!existingInv) {
        await ctx.db.insert("inventory", {
          dropId: DROP_ID,
          code: s.code,
          name: s.name,
          tier: s.tier,
          total: JARS_PER_STRAIN,
          committed: 0,
        });
        inventoryAdded++;
      }
    }

    return { tokensAdded, inventoryAdded, jarsPerStrain: JARS_PER_STRAIN, strains: STRAINS.length };
  },
});
