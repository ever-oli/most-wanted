import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  token: string;
  // When true, only validate the token and return its status. No insert.
  validate_only?: boolean;
  ratings?: {
    nose: number;
    structure: number;
    cure: number;
    burn: number;
    experience: number;
  };
  notes?: string;
  display_name?: string;
  is_public?: boolean;
  early_access_optin?: boolean;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function bad(status: number, message: string, code?: string) {
  return json({ error: message, code }, status);
}

const TOKEN_RE = /^MW-[A-Z0-9-]{2,40}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return bad(405, "Method not allowed");

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return bad(400, "Invalid JSON");
  }

  const token = (body.token || "").trim().toUpperCase();
  if (!TOKEN_RE.test(token)) {
    return bad(400, "Invalid code format. Expected MW-XXXX-XXXX", "bad_format");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Look up token in backend source of truth
  const { data: tokenRow, error: lookupErr } = await supabase
    .from("order_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (lookupErr) {
    console.error("token lookup error", lookupErr);
    return bad(500, "Lookup failed");
  }

  if (!tokenRow) {
    return bad(404, "Code not found. Check your jar card.", "not_found");
  }
  if (tokenRow.redeemed_at) {
    return bad(409, "This code has already been used to submit a review.", "already_used");
  }

  // Validation-only path (used by the form's pre-check)
  if (body.validate_only) {
    return json({
      ok: true,
      verified: true,
      drop_id: tokenRow.drop_id,
      tier: tokenRow.tier,
      square_index: tokenRow.square_index ?? null,
    });
  }

  // Full submit path — require ratings
  const r = body.ratings;
  if (!r) return bad(400, "Missing ratings");
  const keys = ["nose", "structure", "cure", "burn", "experience"] as const;
  for (const k of keys) {
    const v = r[k];
    if (!Number.isInteger(v) || v < 1 || v > 10) return bad(400, `Invalid rating for ${k}`);
  }
  const notes = (body.notes || "").trim().slice(0, 1000);
  const display_name = (body.display_name || "").trim().slice(0, 60) || null;

  const average =
    Math.round(((r.nose + r.structure + r.cure + r.burn + r.experience) / 5) * 100) / 100;

  const { data: inserted, error: insertErr } = await supabase
    .from("reviews")
    .insert({
      order_token: token,
      drop_id: tokenRow.drop_id,
      tier: tokenRow.tier,
      square_index: tokenRow.square_index ?? null,
      nose: r.nose,
      structure: r.structure,
      cure: r.cure,
      burn: r.burn,
      experience: r.experience,
      average,
      notes: notes || null,
      display_name,
      is_public: body.is_public !== false,
      is_verified: true,
      early_access_optin: !!body.early_access_optin,
    })
    .select("id")
    .single();

  if (insertErr) {
    // Unique-violation on order_token => already used race
    if ((insertErr as any).code === "23505") {
      return bad(409, "This code has already been used to submit a review.", "already_used");
    }
    console.error("insert error", insertErr);
    return bad(500, "Could not save review");
  }

  await supabase
    .from("order_tokens")
    .update({ redeemed_at: new Date().toISOString() })
    .eq("token", token);

  // Generate one-time Shopify discount code (best-effort)
  let discount_code: string | null = null;
  try {
    const shop = Deno.env.get("SHOPIFY_SHOP_DOMAIN");
    const adminToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (shop && adminToken) {
      const code = "HUNTER-" + token.split("-").slice(-1)[0] + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      const priceRuleRes = await fetch(`https://${shop}/admin/api/2025-07/price_rules.json`, {
        method: "POST",
        headers: { "X-Shopify-Access-Token": adminToken, "Content-Type": "application/json" },
        body: JSON.stringify({
          price_rule: {
            title: `Hunter reward ${code}`,
            target_type: "line_item",
            target_selection: "all",
            allocation_method: "across",
            value_type: "percentage",
            value: "-10.0",
            customer_selection: "all",
            usage_limit: 1,
            once_per_customer: true,
            starts_at: new Date().toISOString(),
          },
        }),
      });
      if (priceRuleRes.ok) {
        const pr = await priceRuleRes.json();
        const dcRes = await fetch(
          `https://${shop}/admin/api/2025-07/price_rules/${pr.price_rule.id}/discount_codes.json`,
          {
            method: "POST",
            headers: { "X-Shopify-Access-Token": adminToken, "Content-Type": "application/json" },
            body: JSON.stringify({ discount_code: { code } }),
          }
        );
        if (dcRes.ok) discount_code = code;
      }
    }
  } catch (e) {
    console.error("discount code generation failed", e);
  }

  return json({
    success: true,
    review_id: inserted.id,
    verified: true,
    discount_code,
    archive_url: `/archive#review-${inserted.id}`,
  });
});
