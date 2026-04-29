import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // GET => return count only
    if (req.method === "GET") {
      const { count, error } = await admin
        .from("wanted_list_signups")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return json({ count: count ?? 0 });
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!email || email.length > 255 || !EMAIL_RE.test(email)) {
      return json({ error: "Invalid email" }, 400);
    }

    // Insert; ignore unique-violation duplicates
    const { error: insertError } = await admin
      .from("wanted_list_signups")
      .insert({ email });

    if (insertError && insertError.code !== "23505") {
      console.error("insert error", insertError);
      return json({ error: "Could not save signup" }, 500);
    }

    const { count, error: countError } = await admin
      .from("wanted_list_signups")
      .select("*", { count: "exact", head: true });
    if (countError) throw countError;

    return json({
      ok: true,
      duplicate: insertError?.code === "23505",
      count: count ?? 0,
    });
  } catch (err) {
    console.error("wanted-list-signup error", err);
    return json({ error: "Server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
