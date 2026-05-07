import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  drop_id: string;
  tier: "EXO" | "AAA";
  square_index: number | null;
  nose: number;
  structure: number;
  cure: number;
  burn: number;
  experience: number;
  average: number;
  notes: string | null;
  display_name: string | null;
  is_verified: boolean;
  created_at: string;
}

const SCORE_LABELS = ["", "Below", "Fair", "Proper", "Quality", "Exceptional"];

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-stamp uppercase tracking-widest">
      <span className="w-20 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 bg-muted overflow-hidden border border-border/40">
        <div className="h-full bg-gradient-to-r from-primary to-tan" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="w-4 text-right text-foreground">{value}</span>
    </div>
  );
}

export default function Archive() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDrop, setFilterDrop] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(200);
      if (!error && data) setReviews(data as Review[]);
      setLoading(false);
    })();
  }, []);

  // Scroll to anchor after load
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading]);

  const drops = useMemo(() => Array.from(new Set(reviews.map((r) => r.drop_id))), [reviews]);

  const filtered = reviews.filter((r) => {
    if (filterDrop !== "all" && r.drop_id !== filterDrop) return false;
    if (filterTier !== "all" && r.tier !== filterTier) return false;
    return true;
  });

  const aggregate = useMemo(() => {
    if (!filtered.length) return null;
    const sum = filtered.reduce((s, r) => s + Number(r.average), 0);
    return {
      count: filtered.length,
      avg: (sum / filtered.length).toFixed(2),
    };
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 py-6 px-6">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-stamp uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan">Public Ledger</p>
        </div>
      </header>

      <main className="container py-10 md:py-14">
        <div className="text-center mb-10">
          <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— The Archive —</p>
          <h1 className="font-outlaw text-4xl sm:text-5xl md:text-6xl text-shadow-outlaw mb-3">
            Hunters Have <span className="text-primary">Spoken</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
            Every review by an actual buyer. No paid placements. No edits. The track record is the brand.
          </p>
        </div>

        {/* Aggregate strip */}
        {aggregate && (
          <div className="max-w-2xl mx-auto mb-8 border border-border bg-card/60 p-5 flex items-center justify-around text-center">
            <div>
              <div className="font-outlaw text-3xl text-primary text-shadow-outlaw">{aggregate.avg}</div>
              <div className="text-[10px] font-stamp uppercase tracking-widest text-muted-foreground">Avg Score</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="font-outlaw text-3xl text-foreground">{aggregate.count}</div>
              <div className="text-[10px] font-stamp uppercase tracking-widest text-muted-foreground">Reviews</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="font-outlaw text-3xl text-tan">{drops.length || 1}</div>
              <div className="text-[10px] font-stamp uppercase tracking-widest text-muted-foreground">Drops</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-stamp uppercase tracking-widest">
          <button
            onClick={() => setFilterDrop("all")}
            className={cn("px-3 py-1.5 border transition-colors", filterDrop === "all" ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground")}
          >
            All Drops
          </button>
          {drops.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDrop(d)}
              className={cn("px-3 py-1.5 border transition-colors", filterDrop === d ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {d.replace(/-/g, " ")}
            </button>
          ))}
          <span className="mx-2 text-muted-foreground/40">·</span>
          {(["all", "EXO", "AAA"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTier(t)}
              className={cn("px-3 py-1.5 border transition-colors", filterTier === t ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground")}
            >
              {t === "all" ? "All Tiers" : t}
            </button>
          ))}
        </div>

        {/* Reviews grid */}
        {loading ? (
          <p className="text-center text-muted-foreground font-stamp uppercase tracking-widest text-xs">Loading the ledger…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border max-w-md mx-auto">
            <p className="font-stamp uppercase tracking-widest text-sm text-muted-foreground mb-2">No reviews yet</p>
            <p className="text-xs text-muted-foreground/70">Be the first hunter to weigh in. Get a jar, then drop your verdict at <Link to="/review" className="text-primary underline">/review</Link>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {filtered.map((r) => (
              <article
                key={r.id}
                id={`review-${r.id}`}
                className="relative border border-border bg-card p-5 shadow-[var(--shadow-deep)] target:ring-2 target:ring-primary target:ring-offset-2 target:ring-offset-background"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-tan">
                      {r.drop_id.replace(/-/g, " ")}
                    </p>
                    <p className="font-outlaw text-lg text-foreground mt-0.5">
                      {r.display_name || "Anonymous Hunter"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-outlaw text-3xl text-primary text-shadow-outlaw leading-none">
                      {Number(r.average).toFixed(1)}
                    </div>
                    <div className="text-[9px] font-stamp uppercase tracking-widest text-muted-foreground mt-1">
                      {SCORE_LABELS[Math.round(Number(r.average))] || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-[10px] font-stamp uppercase tracking-widest">
                  <span className={cn("px-2 py-0.5 border", r.tier === "EXO" ? "border-tier-exo text-tier-exo" : "border-tier-aaa text-tier-aaa")}>
                    {r.tier}
                  </span>
                  {r.square_index !== null && (
                    <span className="text-muted-foreground">Square #{r.square_index + 1}</span>
                  )}
                  {r.is_verified && (
                    <span className="ml-auto flex items-center gap-1 text-tan">
                      <BadgeCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 mb-4">
                  <ScoreBar label="Nose" value={r.nose} />
                  <ScoreBar label="Structure" value={r.structure} />
                  <ScoreBar label="Cure" value={r.cure} />
                  <ScoreBar label="Burn" value={r.burn} />
                  <ScoreBar label="Experience" value={r.experience} />
                </div>

                {r.notes && (
                  <p className="text-sm text-muted-foreground italic border-l-2 border-tan/40 pl-3 mb-3">
                    "{r.notes}"
                  </p>
                )}

                <p className="text-[10px] font-stamp uppercase tracking-widest text-muted-foreground/60">
                  {new Date(r.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/review"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-stamp uppercase text-xs tracking-widest hover:bg-primary-glow transition-colors shadow-[var(--shadow-outlaw)]"
          >
            <Star className="w-4 h-4" /> Submit Your Review
          </Link>
        </div>
      </main>
    </div>
  );
}
