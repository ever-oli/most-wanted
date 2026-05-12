import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  token: string;
  ratings: {
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
  // Fallbacks if no token row exists yet (early demo / pre-launch flexibility)
  drop_id_fallback?: string;
  tier_fallback?: "EXO" | "AAA";
  square_index_fallback?: number | null;
}

function bad(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return bad(405, "Method not allowed");

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return bad(400, "Invalid JSON");
  }

  // Validate
  const token = (body.token || "").trim().toUpperCase();
  if (!/^MW-[A-Z0-9-]{2,40}$/.test(token)) {
    return bad(400, "Invalid token format. Expected MW-XXXX-XXXX");
  }
  const r = body.ratings;
  if (!r) return bad(400, "Missing ratings");
  const keys = ["nose", "structure", "cure", "burn", "experience"] as const;
  for (const k of keys) {
    const v = r[k];
    if (!Number.isInteger(v) || v < 1 || v > 10) return bad(400, `Invalid rating for ${k}`);
  }
  const notes = (body.notes || "").trim().slice(0, 1000);
  const display_name = (body.display_name || "").trim().slice(0, 60) || null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Look up token
  const { data: tokenRow } = await supabase
    .from("order_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  let drop_id: string;
  let tier: "EXO" | "AAA";
  let square_index: number | null;
  let is_verified = false;

  if (tokenRow) {
    if (tokenRow.redeemed_at) {
      return bad(409, "This token has already been used to submit a review.");
    }
    drop_id = tokenRow.drop_id;
    tier = tokenRow.tier;
    square_index = tokenRow.square_index ?? null;
    is_verified = true;
  } else {
    // Unverified path — accept review but flag it. Useful pre-launch.
    drop_id = (body.drop_id_fallback || "unknown").slice(0, 40);
    tier = body.tier_fallback === "EXO" ? "EXO" : "AAA";
    square_index = typeof body.square_index_fallback === "number" ? body.square_index_fallback : null;
  }

  const average =
    Math.round(((r.nose + r.structure + r.cure + r.burn + r.experience) / 5) * 100) / 100;

  const { data: inserted, error: insertErr } = await supabase
    .from("reviews")
    .insert({
      order_token: token,
      drop_id,
      tier,
      square_index,
      nose: r.nose,
      structure: r.structure,
      cure: r.cure,
      burn: r.burn,
      experience: r.experience,
      average,
      notes: notes || null,
      display_name,
      is_public: body.is_public !== false,
      is_verified,
      early_access_optin: !!body.early_access_optin,
    })
    .select("id")
    .single();

  if (insertErr) {
    console.error("insert error", insertErr);
    return bad(500, "Could not save review");
  }

  if (tokenRow) {
    await supabase
      .from("order_tokens")
      .update({ redeemed_at: new Date().toISOString() })
      .eq("token", token);
  }

  // Generate one-time discount code via Shopify Admin API (best-effort)
  let discount_code: string | null = null;
  try {
    const shop = Deno.env.get("SHOPIFY_SHOP_DOMAIN");
    const adminToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (shop && adminToken) {
      const code = "HUNTER-" + token.split("-").slice(-1)[0] + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      // Shopify Admin: create a price rule + discount code (10% off, single use)
      const priceRuleRes = await fetch(`https://${shop}/admin/api/2025-07/price_rules.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": adminToken,
          "Content-Type": "application/json",
        },
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
            headers: {
              "X-Shopify-Access-Token": adminToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ discount_code: { code } }),
          }
        );
        if (dcRes.ok) discount_code = code;
      }
    }
  } catch (e) {
    console.error("discount code generation failed", e);
  }

  return new Response(
    JSON.stringify({
      success: true,
      review_id: inserted.id,
      verified: is_verified,
      discount_code,
      archive_url: `/archive#review-${inserted.id}`,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});
