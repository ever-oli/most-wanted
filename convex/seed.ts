import { mutation } from "./_generated/server";

// First jar/review code per strain for the HillTop Budz Farm drop.
// Code format: MW-HBF-<STRAIN_CODE>-<NN> (grower then strain, matching the cards).
// Add more rows (…-02, -03) as physical jars are printed. Run with:
//   npx convex run seed:run
const DROP_ID = "hilltop-budz-farm";
const TOKENS: { token: string; tier: "EXCLUSIVE" | "EXO" | "AAA" }[] = [
  { token: "MW-HBF-TOG-01", tier: "EXCLUSIVE" }, // Tenderism OG (F&F)
  { token: "MW-HBF-PLCG-01", tier: "EXO" },      // Platinum Lemon Cherry Gelato
  { token: "MW-HBF-CB-01", tier: "EXO" },        // Crunch Berriez
  { token: "MW-HBF-SB-01", tier: "EXO" },        // Super Boof
  { token: "MW-HBF-G41-01", tier: "EXO" },       // Gelato 41
  { token: "MW-HBF-SLP-01", tier: "EXO" },       // Slapz
  { token: "MW-HBF-HB-01", tier: "AAA" },        // Honey Banana
  { token: "MW-HBF-LCG-01", tier: "AAA" },       // Lemon Cherry Gelato
  { token: "MW-HBF-OC-01", tier: "AAA" },        // Oreo Cake
  { token: "MW-HBF-WR-01", tier: "AAA" },        // White Runtz
];

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    let added = 0;
    for (const t of TOKENS) {
      const existing = await ctx.db
        .query("orderTokens")
        .withIndex("by_token", (q) => q.eq("token", t.token))
        .unique();
      if (!existing) {
        await ctx.db.insert("orderTokens", {
          token: t.token,
          dropId: DROP_ID,
          tier: t.tier,
          squareIndex: null,
        });
        added++;
      }
    }
    return { added, total: TOKENS.length };
  },
});
