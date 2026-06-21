import { query } from "./_generated/server";

/** Public remaining-stock summary per strain (drives sold-out handling). */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("inventory").collect();
    return rows.map((r) => ({
      code: r.code,
      name: r.name,
      tier: r.tier,
      total: r.total,
      remaining: Math.max(0, r.total - r.committed),
    }));
  },
});
