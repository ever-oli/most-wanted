import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const count = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("wantedListSignups").collect();
    return { count: rows.length };
  },
});

export const signup = mutation({
  args: { email: v.string(), square_index: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email || email.length > 255 || !EMAIL_RE.test(email)) {
      throw new ConvexError("Invalid email");
    }

    const existing = await ctx.db
      .query("wantedListSignups")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const duplicate = !!existing;
    if (!existing) {
      await ctx.db.insert("wantedListSignups", {
        email,
        squareIndex: args.square_index ?? null,
      });
    }

    const all = await ctx.db.query("wantedListSignups").collect();
    return { ok: true, duplicate, count: all.length };
  },
});
