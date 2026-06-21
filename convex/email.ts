import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const RESEND_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Most Wanted Packs <onboarding@resend.dev>";

/** Send via Resend. No-op (logs) if RESEND_API_KEY isn't configured. */
async function send(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping email to", to);
    return false;
  }
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("Resend request failed", e);
    return false;
  }
}

const shell = (inner: string) => `
  <div style="background:#0a0a0a;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#e8e0d4;">
    <div style="max-width:520px;margin:0 auto;background:#121010;border:1px solid #3a2f2f;border-radius:14px;padding:28px;">
      <p style="margin:0 0 6px;color:#d4af37;letter-spacing:3px;text-transform:uppercase;font-size:11px;">Most Wanted Packs</p>
      ${inner}
      <hr style="border:none;border-top:1px solid #2a2424;margin:24px 0;" />
      <p style="font-size:11px;color:#7a7066;line-height:1.6;margin:0;">
        2018 Farm Bill compliant hemp. 21+. Not evaluated by the FDA; not intended to diagnose, treat, cure, or prevent any disease.
        Questions? Reply to this email or reach us on Instagram @mstwntdpacks.
      </p>
    </div>
  </div>`;

export const sendOrderConfirmation = internalAction({
  args: {
    to: v.string(),
    orderCode: v.string(),
    total: v.number(),
    jarCount: v.number(),
    paymentMethod: v.string(),
    items: v.array(v.object({ name: v.string(), tier: v.string() })),
  },
  handler: async (_ctx, a) => {
    const isChime = a.paymentMethod === "chime";
    const method = isChime ? "Chime" : "CashApp";
    const handle = isChime
      ? process.env.CHIME_HANDLE || "$Everardo-Olivares-2"
      : process.env.CASHAPP_TAG || "$everoli";
    const list = a.items
      .map((i) => `<li style="margin:2px 0;">${i.name} <span style="color:#7a7066;">(${i.tier})</span></li>`)
      .join("");
    const inner = `
      <h1 style="margin:0 0 14px;color:#f3ead5;font-size:24px;">Order placed — finish payment</h1>
      <p style="font-size:14px;line-height:1.6;color:#c9bfb2;margin:0 0 18px;">
        We've reserved your haul. To lock it in, send <strong style="color:#f3ead5;">$${a.total}</strong> via
        <strong>${method}</strong> to <strong style="color:#d4af37;">${handle}</strong> and put this code in the payment note:
      </p>
      <p style="text-align:center;font-size:28px;letter-spacing:4px;color:#f5d77a;background:#0a0a0a;border:1px solid #6b561d;border-radius:8px;padding:14px;margin:0 0 18px;">
        ${a.orderCode}
      </p>
      <p style="font-size:13px;color:#c9bfb2;margin:0 0 6px;">Your ${a.jarCount} jar${a.jarCount > 1 ? "s" : ""}:</p>
      <ul style="font-size:13px;color:#e8e0d4;padding-left:18px;margin:0 0 8px;">${list}</ul>
      <p style="font-size:12px;color:#9a8f82;margin:14px 0 0;">No code in the note = we can't match your payment. Reservations expire if unpaid.</p>`;
    await send(a.to, `Your Most Wanted order ${a.orderCode}`, shell(inner));
  },
});

export const sendShipped = internalAction({
  args: {
    to: v.string(),
    orderCode: v.string(),
    trackingNumber: v.union(v.string(), v.null()),
  },
  handler: async (_ctx, a) => {
    const tracking = a.trackingNumber
      ? `<p style="font-size:14px;color:#c9bfb2;margin:0 0 8px;">Tracking: <strong style="color:#f3ead5;">${a.trackingNumber}</strong></p>`
      : "";
    const inner = `
      <h1 style="margin:0 0 14px;color:#f3ead5;font-size:24px;">It's on the way</h1>
      <p style="font-size:14px;line-height:1.6;color:#c9bfb2;margin:0 0 14px;">
        Order <strong style="color:#d4af37;">${a.orderCode}</strong> has shipped. Keep an eye out — it ships discreet.
      </p>
      ${tracking}`;
    await send(a.to, `Your Most Wanted order ${a.orderCode} shipped`, shell(inner));
  },
});
