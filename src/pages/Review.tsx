import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Star, Send, Hash, AlertCircle, BadgeCheck, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RatingRow {
  name: string;
  label: string;
  description: string;
  value: number;
}

const CRITERIA: Omit<RatingRow, "value">[] = [
  { name: "NOSE", label: "Nose", description: "Aroma complexity and intensity" },
  { name: "STRUCTURE", label: "Structure", description: "Bud density, trim quality, visual appeal" },
  { name: "CURE", label: "Cure", description: "Moisture, cure quality, stickiness" },
  { name: "BURN", label: "Burn", description: "Ash color, smoothness, evenness" },
  { name: "EXPERIENCE", label: "Experience", description: "Effects, duration, satisfaction" },
];

export default function Review() {
  const [batchCode, setBatchCode] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [earlyAccess, setEarlyAccess] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; discount_code: string | null; review_id: string } | null>(null);

  const average = useCallback(() => {
    const values = Object.values(ratings);
    if (values.length < CRITERIA.length) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  }, [ratings]);

  const isComplete = CRITERIA.every((c) => ratings[c.name] > 0) && batchCode.trim().length > 0;

  const handleRate = (criterion: string, value: number) => {
    setRatings((prev) => ({ ...prev, [criterion]: value }));
  };

  const handleSubmit = async () => {
    if (!isComplete || submitting) return;
    setSubmitting(true);

    const token = batchCode.trim().toUpperCase();
    try {
      const { data, error } = await supabase.functions.invoke("submit-review", {
        body: {
          token,
          ratings: {
            nose: ratings.NOSE,
            structure: ratings.STRUCTURE,
            cure: ratings.CURE,
            burn: ratings.BURN,
            experience: ratings.EXPERIENCE,
          },
          notes: notes.trim(),
          display_name: displayName.trim(),
          is_public: isPublic,
          early_access_optin: earlyAccess,
          // Pre-launch fallback so unverified reviews still log
          drop_id_fallback: "red-river-rivalry",
          tier_fallback: "AAA",
        },
      });

      if (error || !data?.success) {
        const msg = (error as any)?.context?.error || (error as any)?.message || data?.error || "Submission failed";
        toast.error(msg);
        setSubmitting(false);
        return;
      }

      setResult({ verified: data.verified, discount_code: data.discount_code, review_id: data.review_id });
      toast.success("Evaluation logged. Your verdict is now part of the archive.");
      setSubmitted(true);
    } catch (e: any) {
      toast.error(e?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreLabel = (score: number) => {
    if (score === 0) return "—";
    if (score <= 1.5) return "Below Standard";
    if (score <= 2.5) return "Fair";
    if (score <= 3.5) return "Proper";
    if (score <= 4.5) return "Quality";
    return "Exceptional";
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return "text-muted-foreground";
    if (score <= 2) return "text-destructive";
    if (score <= 3) return "text-secondary";
    return "text-primary";
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-reveal">
          <div className="text-6xl font-outlaw text-primary text-shadow-outlaw">
            {average()}
          </div>
          <div className="text-muted-foreground font-stamp uppercase tracking-widest text-sm">
            Average Score — {getScoreLabel(parseFloat(average() as string))}
          </div>
          <div className="border-t border-border pt-6">
            <h2 className="font-outlaw text-2xl mb-2">Thank You</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your evaluation has been recorded. This batch is now part of the archive.
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setBatchCode("");
              setRatings({});
              setNotes("");
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Submit another evaluation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 py-8 px-6">
        <div className="max-w-lg mx-auto text-center space-y-2">
          <h1 className="font-outlaw text-3xl md:text-4xl tracking-wider text-shadow-outlaw">
            MOST WANTED
          </h1>
          <p className="font-stamp text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Product Evaluation Card
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-6 py-8 space-y-8">
        {/* Batch Code */}
        <section className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-stamp uppercase tracking-wider text-muted-foreground">
            <Hash className="w-4 h-4" />
            Batch Code
          </label>
          <input
            type="text"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            placeholder="e.g. MW-0427"
            className="w-full bg-card border border-border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-stamp uppercase"
          />
          <p className="text-xs text-muted-foreground/60">
            Found on your jar label or printed card.
          </p>
        </section>

        {/* Ratings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-stamp text-xs uppercase tracking-[0.2em] text-muted-foreground">
              The Five Points
            </h2>
            <div className={`font-outlaw text-2xl ${getScoreColor(parseFloat(average() as string))}`}>
              {average()} <span className="text-xs font-sans text-muted-foreground">/ 5</span>
            </div>
          </div>

          <div className="space-y-4">
            {CRITERIA.map((criterion) => (
              <div
                key={criterion.name}
                className="bg-card border border-border/60 rounded p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-outlaw text-lg">{criterion.label}</div>
                    <div className="text-xs text-muted-foreground">{criterion.description}</div>
                  </div>
                  <div className={`font-stamp text-sm ${getScoreColor(ratings[criterion.name] || 0)}`}>
                    {ratings[criterion.name] ? getScoreLabel(ratings[criterion.name]) : "—"}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRate(criterion.name, value)}
                      className={`p-1 transition-all duration-200 ${
                        ratings[criterion.name] >= value
                          ? "text-primary scale-110"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60"
                      }`}
                      aria-label={`Rate ${criterion.label} ${value} out of 5`}
                    >
                      <Star
                        className="w-6 h-6"
                        fill={ratings[criterion.name] >= value ? "currentColor" : "none"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Score Key */}
        <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-stamp text-muted-foreground/60">
          <div>1<br />Below</div>
          <div>2<br />Fair</div>
          <div>3<br />Proper</div>
          <div>4<br />Quality</div>
          <div>5<br />Exceptional</div>
        </div>

        {/* Notes */}
        <section className="space-y-3">
          <label className="font-stamp text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="One word to describe this batch, or any observations..."
            rows={4}
            className="w-full bg-card border border-border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none"
          />
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`w-full py-4 rounded font-outlaw text-lg tracking-wider transition-all duration-300 flex items-center justify-center gap-3 ${
            isComplete
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-outlaw animate-pulse-red"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          <Send className="w-5 h-5" />
          {isComplete ? "Submit Evaluation" : "Complete All Fields"}
        </button>

        {!isComplete && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60 justify-center">
            <AlertCircle className="w-3 h-3" />
            Enter batch code and rate all five criteria to submit
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-6 mt-8">
        <div className="max-w-lg mx-auto text-center space-y-1">
          <p className="font-stamp text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
            Your feedback drives our next hunt
          </p>
          <p className="font-stamp text-[10px] text-muted-foreground/40">
            mostwantedhemp.co
          </p>
        </div>
      </footer>
    </div>
  );
}
