import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, Send, Hash, AlertCircle, BadgeCheck, Gift, X, ImagePlus, Play, Film } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CODE_FORMAT_RE = /^MW-[A-Z0-9-]{2,40}$/;
type CodeCheck =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; drop_id: string; tier: string }
  | { status: "invalid"; message: string };

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

interface MediaFile {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
}

export default function Review() {
  const [searchParams] = useSearchParams();
  const [batchCode, setBatchCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = searchParams.get("token") || searchParams.get("batch");
    if (t) setBatchCode(t.toUpperCase());
  }, [searchParams]);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [earlyAccess, setEarlyAccess] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; discount_code: string | null; review_id: string } | null>(null);
  const [media, setMedia] = useState<MediaFile[]>([]);


  const [codeCheck, setCodeCheck] = useState<CodeCheck>({ status: "idle" });

  const average = useCallback(() => {
    const values = Object.values(ratings);
    if (values.length < CRITERIA.length) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  }, [ratings]);

  const trimmedCode = batchCode.trim().toUpperCase();
  const isFormatValid = CODE_FORMAT_RE.test(trimmedCode);
  const isCodeVerified = codeCheck.status === "valid";
  const isComplete = CRITERIA.every((c) => ratings[c.name] > 0) && isCodeVerified;

  // Debounced backend pre-check (like a promo code validator)
  useEffect(() => {
    if (!isFormatValid) {
      setCodeCheck(trimmedCode.length === 0 ? { status: "idle" } : { status: "invalid", message: "Format: MW-XXXX-XXXX" });
      return;
    }
    setCodeCheck({ status: "checking" });
    const handle = setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke("submit-review", {
        body: { token: trimmedCode, validate_only: true },
      });
      if (error) {
        const ctx = (error as any)?.context;
        let msg = "Code not found. Check your jar card.";
        try {
          const parsed = ctx ? (typeof ctx === "string" ? JSON.parse(ctx) : ctx) : null;
          if (parsed?.error) msg = parsed.error;
        } catch { /* ignore */ }
        setCodeCheck({ status: "invalid", message: msg });
        return;
      }
      if (data?.ok && data?.verified) {
        setCodeCheck({ status: "valid", drop_id: data.drop_id, tier: data.tier });
      } else {
        setCodeCheck({ status: "invalid", message: data?.error || "Code not valid." });
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [trimmedCode, isFormatValid]);

  const handleRate = (criterion: string, value: number) => {
    setRatings((prev) => ({ ...prev, [criterion]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: MediaFile[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
      if (media.length + newMedia.length >= 10) {
        toast.error("Max 10 media items per review.");
        return;
      }
      const id = Math.random().toString(36).slice(2);
      const type = file.type.startsWith("video/") ? "video" : "image";
      newMedia.push({ id, file, previewUrl: URL.createObjectURL(file), type });
    });

    if (newMedia.length > 0) {
      setMedia((prev) => [...prev, ...newMedia]);
    }
    e.target.value = "";
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
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
          drop_id_fallback: "belgium",
          tier_fallback: "AAA",
          media_count: media.length,
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
    if (score <= 3) return "Below Standard";
    if (score <= 5) return "Fair";
    if (score <= 7) return "Proper";
    if (score <= 9) return "Quality";
    return "Exceptional";
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return "text-muted-foreground";
    if (score <= 4) return "text-destructive";
    if (score <= 6) return "text-secondary";
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

          {result?.verified && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-tan/60 text-tan font-stamp uppercase text-[10px] tracking-widest">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified Hunter
            </div>
          )}

          {result?.discount_code && (
            <div className="border border-primary/60 bg-card p-5 space-y-2">
              <div className="flex items-center justify-center gap-2 font-stamp uppercase text-[10px] tracking-widest text-tan">
                <Gift className="w-4 h-4" /> Hunter Reward — 10% off next drop
              </div>
              <div className="font-stamp text-2xl tracking-[0.2em] text-foreground select-all">
                {result.discount_code}
              </div>
              <p className="text-[10px] text-muted-foreground">Single use. Save it.</p>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <h2 className="font-outlaw text-2xl mb-2">Logged.</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your verdict is now part of the public archive.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to={result ? `/archive#review-${result.review_id}` : "/archive"}
              className="px-5 py-3 bg-primary text-primary-foreground font-stamp uppercase text-xs tracking-widest hover:bg-primary-glow transition-colors shadow-[var(--shadow-outlaw)]"
            >
              View Your Entry in the Archive
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setResult(null);
                setBatchCode("");
                setRatings({});
                setNotes("");
                setDisplayName("");
                setMedia([]);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Submit another evaluation
            </button>
          </div>
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
            placeholder="MW-RRR-DA-2A7K"
            className={`w-full bg-card border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-all font-stamp uppercase ${
              batchCode.trim().length > 0 && !isValidCode
                ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                : "border-border focus:border-primary focus:ring-primary/30"
            }`}
          />
          <p className="text-xs text-muted-foreground/60">
            Format: <span className="font-stamp text-foreground/80">MW-DROP-GROWER-CODE</span>. Found on your jar card. Invalid or missing code — submission blocked.
          </p>
        </section>

        {/* Ratings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-stamp text-xs uppercase tracking-[0.2em] text-muted-foreground">
              The Ten Points
            </h2>
            <div className={`font-outlaw text-2xl ${getScoreColor(parseFloat(average() as string))}`}>
              {average()} <span className="text-xs font-sans text-muted-foreground">/ 10</span>
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

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRate(criterion.name, value)}
                      className={`p-0.5 transition-all duration-200 ${
                        ratings[criterion.name] >= value
                          ? "text-primary scale-110"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60"
                      }`}
                      aria-label={`Rate ${criterion.label} ${value} out of 10`}
                    >
                      <Star
                        className="w-5 h-5"
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
          <div>1–3<br />Below</div>
          <div>4–5<br />Fair</div>
          <div>6–7<br />Proper</div>
          <div>8–9<br />Quality</div>
          <div>10<br />Exceptional</div>
        </div>

        {/* Media Upload — Instagram-style */}
        <section className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-stamp uppercase tracking-wider text-muted-foreground">
            <ImagePlus className="w-4 h-4" />
            Media
          </label>

          <div className="grid grid-cols-3 gap-2">
            {media.map((item) => (
              <div key={item.id} className="relative aspect-square group rounded-lg overflow-hidden border border-border bg-card">
                {item.type === "video" ? (
                  <video src={item.previewUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <button
                  onClick={() => removeMedia(item.id)}
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove media"
                >
                  <X className="w-3 h-3" />
                </button>
                {item.type === "video" && (
                  <div className="absolute bottom-1 left-1 p-1 bg-black/60 text-white rounded">
                    <Play className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {media.length < 10 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-primary/60 hover:bg-card/60 transition-all"
              >
                <Film className="w-6 h-6 text-muted-foreground/60" />
                <span className="text-[10px] font-stamp uppercase tracking-wider text-muted-foreground/60">
                  Add
                </span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground/60">
            Photos or videos of your jar, buds, smoke session — max 10 items.
          </p>
        </section>

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

        {/* Identity */}
        <section className="space-y-3">
          <label className="font-stamp text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Display Name <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. TX Hunter"
            maxLength={60}
            className="w-full bg-card border border-border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-stamp"
          />
          <p className="text-xs text-muted-foreground/60">
            How you'll appear in the public archive. Leave blank for "Anonymous Hunter".
          </p>
        </section>

        {/* Toggles */}
        <section className="space-y-3 border border-border/60 bg-card/40 p-4 rounded">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span className="text-sm">
              <span className="font-stamp uppercase tracking-widest text-xs text-foreground">Show in public archive</span>
              <span className="block text-xs text-muted-foreground mt-0.5">Your review helps other hunters trust the brand.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={earlyAccess}
              onChange={(e) => setEarlyAccess(e.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span className="text-sm">
              <span className="font-stamp uppercase tracking-widest text-xs text-foreground">Hunter early access list</span>
              <span className="block text-xs text-muted-foreground mt-0.5">Get notified 24h before the next drop opens.</span>
            </span>
          </label>
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isComplete || submitting}
          className={`w-full py-4 rounded font-outlaw text-lg tracking-wider transition-all duration-300 flex items-center justify-center gap-3 ${
            isComplete && !submitting
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-outlaw animate-pulse-red"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          <Send className="w-5 h-5" />
          {submitting ? "Submitting…" : isComplete ? "Submit Evaluation" : "Complete All Fields"}
        </button>

        {!isComplete && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60 justify-center">
            <AlertCircle className="w-3 h-3" />
            {batchCode.trim().length > 0 && !isValidCode
              ? "Invalid batch code — check your jar card"
              : "Enter a valid batch code and rate all five criteria to submit"}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/60">
          Or browse the <Link to="/archive" className="text-primary underline">public archive</Link>.
        </p>
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
