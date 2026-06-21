import { action, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";

const JAR_PRICE = 89;
const MAX_JARS = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// No ambiguous chars (no O/0/I/1/L) — reads like a neutral reference in a memo.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function makeCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return `MW-${s}`;
}

const itemValidator = v.object({
  code: v.string(),
  name: v.string(),
  alias: v.optional(v.string()),
  tier: v.optional(v.string()),
});

/** Internal: insert an order with a collision-free code (transactional). */
export const insertOrder = internalMutation({
  args: {
    dropId: v.string(),
    customerName: v.string(),
    email: v.string(),
    phone: v.union(v.string(), v.null()),
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
    paymentMethod: v.string(),
    customerNote: v.union(v.string(), v.null()),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const orderCode = makeCode();
      const exists = await ctx.db
        .query("orders")
        .withIndex("by_code", (q) => q.eq("orderCode", orderCode))
        .unique();
      if (exists) continue;
      await ctx.db.insert("orders", { orderCode, status: "pending_payment", ...args });
      return { orderCode };
    }
    throw new ConvexError("Could not generate a unique order code. Try again.");
  },
});

/** Public: place an order (pending payment) and fire the operator alert. */
export const create = action({
  args: {
    drop_id: v.optional(v.string()),
    customer: v.object({ name: v.string(), email: v.string(), phone: v.optional(v.string()) }),
    shipping: v.object({
      address: v.string(),
      address2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    }),
    items: v.array(itemValidator),
    payment_method: v.optional(v.string()),
    note: v.optional(v.string()),
    age_confirmed: v.optional(v.boolean()),
    agree_terms: v.optional(v.boolean()),
  },
  handler: async (ctx, body) => {
    const name = (body.customer.name || "").trim().slice(0, 120);
    const email = (body.customer.email || "").trim().toLowerCase().slice(0, 160);
    const phone = (body.customer.phone || "").trim().slice(0, 40) || null;
    const ship = body.shipping;
    const method = body.payment_method === "chime" ? "chime" : "cashapp";

    if (!name) throw new ConvexError("Name is required");
    if (!EMAIL_RE.test(email)) throw new ConvexError("A valid email is required");
    if (!(ship.address && ship.city && ship.state && ship.zip)) {
      throw new ConvexError("Full shipping address is required");
    }
    if (body.items.length < 1 || body.items.length > MAX_JARS) {
      throw new ConvexError("Order must have 1–12 jars");
    }
    if (!body.age_confirmed) throw new ConvexError("You must confirm you are 21+");
    if (!body.agree_terms) throw new ConvexError("You must agree to the terms");

    const items = body.items.map((it) => ({
      code: String(it.code || "").slice(0, 16),
      name: String(it.name || "").slice(0, 80),
      alias: String(it.alias || it.name || "").slice(0, 80),
      tier: String(it.tier || "").slice(0, 16),
      price: JAR_PRICE,
    }));

    const jarCount = items.length;
    const subtotal = jarCount * JAR_PRICE;
    const total = subtotal;
    const windowMin = Number(process.env.ORDER_WINDOW_MINUTES) || 30;
    const expiresAt = Date.now() + windowMin * 60_000;

    const { orderCode } = await ctx.runMutation(internal.orders.insertOrder, {
      dropId: (body.drop_id || "hilltop-budz-farm").slice(0, 60),
      customerName: name,
      email,
      phone,
      shippingAddress: {
        address: String(ship.address).slice(0, 200),
        address2: String(ship.address2 || "").slice(0, 200),
        city: String(ship.city).slice(0, 100),
        state: String(ship.state).slice(0, 60),
        zip: String(ship.zip).slice(0, 20),
      },
      items,
      jarCount,
      subtotal,
      total,
      paymentMethod: method,
      customerNote: (body.note || "").trim().slice(0, 500) || null,
      expiresAt,
    });

    // Best-effort operator alert (Discord/Telegram/Zapier-style webhook).
    try {
      const hook = process.env.ORDER_ALERT_WEBHOOK;
      if (hook) {
        const lines = items.map((i) => `• ${i.name} (${i.tier})`).join("\n");
        await fetch(hook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🧾 New order ${orderCode} — $${total} • ${jarCount} jar(s) • ${name} • ${ship.city}, ${ship.state} • pay via ${method}\n${lines}`,
          }),
        });
      }
    } catch (e) {
      console.error("order alert webhook failed", e);
    }

    return { ok: true, order_code: orderCode, total, jar_count: jarCount, payment_method: method, expires_at: expiresAt };
  },
});

function assertAdmin(passphrase: string) {
  const expected = process.env.ADMIN_PASSPHRASE;
  if (!expected) throw new ConvexError("Dashboard not configured");
  if (passphrase !== expected) throw new ConvexError("Wrong passphrase");
}

/** Passphrase-gated: list orders (expiring stale ones first). */
export const adminList = mutation({
  args: { passphrase: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, { passphrase, status }) => {
    assertAdmin(passphrase);

    const now = Date.now();
    const pending = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending_payment"))
      .collect();
    for (const o of pending) {
      if (o.expiresAt && o.expiresAt < now) await ctx.db.patch(o._id, { status: "expired" });
    }

    const rows = status
      ? await ctx.db
          .query("orders")
          .withIndex("by_status", (q) => q.eq("status", status as never))
          .order("desc")
          .take(300)
      : await ctx.db.query("orders").order("desc").take(300);

    return { ok: true, orders: rows };
  },
});

/** Passphrase-gated: move an order between statuses. */
export const adminUpdate = mutation({
  args: { passphrase: v.string(), id: v.id("orders"), to: v.string() },
  handler: async (ctx, { passphrase, id, to }) => {
    assertAdmin(passphrase);
    const allowed = ["pending_payment", "paid", "shipped", "cancelled", "expired"];
    if (!allowed.includes(to)) throw new ConvexError("Bad status");
    const patch: Record<string, unknown> = { status: to };
    if (to === "paid") patch.paidAt = Date.now();
    if (to === "shipped") patch.shippedAt = Date.now();
    await ctx.db.patch(id, patch);
    return { ok: true };
  },
});
