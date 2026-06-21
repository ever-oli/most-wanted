import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const tier = v.union(v.literal("EXCLUSIVE"), v.literal("EXO"), v.literal("AAA"));

const orderStatus = v.union(
  v.literal("pending_payment"),
  v.literal("paid"),
  v.literal("shipped"),
  v.literal("cancelled"),
  v.literal("expired"),
);

export default defineSchema({
  // Verified buyer reviews (public Archive + leaderboard).
  reviews: defineTable({
    orderToken: v.string(),
    dropId: v.string(),
    tier,
    squareIndex: v.optional(v.union(v.number(), v.null())),
    nose: v.number(),
    structure: v.number(),
    cure: v.number(),
    burn: v.number(),
    experience: v.number(),
    average: v.number(),
    notes: v.optional(v.union(v.string(), v.null())),
    displayName: v.optional(v.union(v.string(), v.null())),
    isPublic: v.boolean(),
    isVerified: v.boolean(),
  })
    .index("by_public", ["isPublic"])
    .index("by_token", ["orderToken"]),

  // Source of truth for redeemable jar/review codes.
  orderTokens: defineTable({
    token: v.string(),
    dropId: v.string(),
    tier,
    squareIndex: v.optional(v.union(v.number(), v.null())),
    email: v.optional(v.union(v.string(), v.null())),
    redeemedAt: v.optional(v.union(v.number(), v.null())),
  }).index("by_token", ["token"]),

  // Pre-drop recruitment signups.
  wantedListSignups: defineTable({
    email: v.string(),
    squareIndex: v.optional(v.union(v.number(), v.null())),
  }).index("by_email", ["email"]),

  // Manual pay-by-memo orders (interim, pre-processor).
  orders: defineTable({
    orderCode: v.string(),
    status: orderStatus,
    dropId: v.string(),
    customerName: v.string(),
    email: v.string(),
    phone: v.optional(v.union(v.string(), v.null())),
    shippingAddress: v.object({
      address: v.string(),
      address2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
    items: v.array(
      v.object({
        code: v.string(),
        name: v.string(),
        alias: v.string(),
        tier: v.string(),
        price: v.number(),
      }),
    ),
    jarCount: v.number(),
    subtotal: v.number(),
    total: v.number(),
    paymentMethod: v.optional(v.string()),
    customerNote: v.optional(v.union(v.string(), v.null())),
    expiresAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    shippedAt: v.optional(v.number()),
  })
    .index("by_code", ["orderCode"])
    .index("by_status", ["status"]),
});
