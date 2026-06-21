import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

const TOKEN_RE = /^MW-[A-Z0-9-]{2,40}$/;

/** Public review history for the Archive + leaderboard. snake_case keys so the
 *  frontend shape is stable. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(200);
    return rows.map((r) => ({
      id: r._id,
      drop_id: r.dropId,
      tier: r.tier,
      square_index: r.squareIndex ?? null,
      nose: r.nose,
      structure: r.structure,
      cure: r.cure,
      burn: r.burn,
      experience: r.experience,
      average: r.average,
      notes: r.notes ?? null,
      display_name: r.displayName ?? null,
      is_verified: r.isVerified,
      created_at: new Date(r._creationTime).toISOString(),
    }));
  },
});

/** Promo-code-style pre-check of a jar code. Returns a result object (never
 *  throws) so the form can show inline status. */
export const validateCode = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const t = token.trim().toUpperCase();
    if (!TOKEN_RE.test(t)) return { ok: false, code: "bad_format", error: "Format: MW-XXXX-XXXX" };
    const row = await ctx.db
      .query("orderTokens")
      .withIndex("by_token", (q) => q.eq("token", t))
      .unique();
    if (!row) return { ok: false, code: "not_found", error: "Code not found. Check your jar card." };
    if (row.redeemedAt) return { ok: false, code: "already_used", error: "This code has already been used." };
    return { ok: true, verified: true, drop_id: row.dropId, tier: row.tier, square_index: row.squareIndex ?? null };
  },
});

export const submit = mutation({
  args: {
    token: v.string(),
    ratings: v.object({
      nose: v.number(),
      structure: v.number(),
      cure: v.number(),
      burn: v.number(),
      experience: v.number(),
    }),
    notes: v.optional(v.string()),
    display_name: v.optional(v.string()),
    is_public: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const t = args.token.trim().toUpperCase();
    if (!TOKEN_RE.test(t)) throw new ConvexError("Invalid code format.");

    const tokenRow = await ctx.db
      .query("orderTokens")
      .withIndex("by_token", (q) => q.eq("token", t))
      .unique();
    if (!tokenRow) throw new ConvexError("Code not found. Check your jar card.");
    if (tokenRow.redeemedAt) throw new ConvexError("This code has already been used to submit a review.");

    const r = args.ratings;
    for (const k of ["nose", "structure", "cure", "burn", "experience"] as const) {
      const val = r[k];
      if (!Number.isInteger(val) || val < 1 || val > 10) throw new ConvexError(`Invalid rating for ${k}`);
    }

    const average = Math.round(((r.nose + r.structure + r.cure + r.burn + r.experience) / 5) * 100) / 100;

    const reviewId = await ctx.db.insert("reviews", {
      orderToken: t,
      dropId: tokenRow.dropId,
      tier: tokenRow.tier,
      squareIndex: tokenRow.squareIndex ?? null,
      nose: r.nose,
      structure: r.structure,
      cure: r.cure,
      burn: r.burn,
      experience: r.experience,
      average,
      notes: (args.notes || "").trim().slice(0, 1000) || null,
      displayName: (args.display_name || "").trim().slice(0, 60) || null,
      isPublic: args.is_public !== false,
      isVerified: true,
    });

    await ctx.db.patch(tokenRow._id, { redeemedAt: Date.now() });

    return { success: true, review_id: reviewId, verified: true, discount_code: null };
  },
});
