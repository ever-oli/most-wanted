import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Target } from "lucide-react";
import { RECRUITMENT_GOAL } from "@/lib/drop-config";
import { supabase } from "@/integrations/supabase/client";

const MINE_KEY = "mwp-wanted-list:mine";
/** Demo seed so the tally never reads 0 — added on top of real DB count. */
const DEMO_BASE_COUNT = 47;

export const WantedListRecruitment = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [count, setCount] = useState(DEMO_BASE_COUNT);
  const [submitting, setSubmitting] = useState(false);

  // Load live count + remember if this device already signed
  useEffect(() => {
    if (localStorage.getItem(MINE_KEY)) setSubscribed(true);

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "wanted-list-signup",
          { method: "GET" }
        );
        if (cancelled) return;
        if (!error && data && typeof data.count === "number") {
          setCount(DEMO_BASE_COUNT + data.count);
        }
      } catch {
        /* keep seed count on failure */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = Math.max(0, RECRUITMENT_GOAL - count);
  const pct = Math.min(100, (count / RECRUITMENT_GOAL) * 100);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email.", { className: "font-stamp" });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "wanted-list-signup",
        { body: { email: trimmed } }
      );

      if (error || !data?.ok) {
        toast.error("Could not sign you on. Try again.", {
          className: "font-stamp",
        });
        return;
      }

      if (typeof data.count === "number") {
        setCount(DEMO_BASE_COUNT + data.count);
      }
      localStorage.setItem(MINE_KEY, "1");
      setSubscribed(true);
      setEmail("");

      toast.success(
        data.duplicate ? "You're already on the list." : "You're on the wanted list.",
        {
          description: "Once 256 hunters sign on, the countdown begins.",
          className: "font-stamp",
        }
      );
    } catch {
      toast.error("Network error. Try again.", { className: "font-stamp" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div className="relative z-20 w-full max-w-md text-center px-6 py-8 border border-primary/50 bg-card/95 shadow-[var(--shadow-outlaw)] rounded-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 mb-4">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span className="font-stamp text-[10px] uppercase tracking-[0.25em] text-tan">
            Recruiting Hunters
          </span>
        </div>

        <h3 className="font-outlaw text-xl md:text-2xl text-foreground text-shadow-outlaw mb-2">
          Sign The Wanted List
        </h3>
        <p className="font-stamp text-xs text-muted-foreground italic mb-6">
          When 256 hunters sign on, the vault arms and the countdown begins.
        </p>

        {/* Tally */}
        <div className="mb-5">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="font-outlaw text-4xl md:text-5xl text-primary text-shadow-outlaw tabular-nums">
              {count}
            </span>
            <span className="font-stamp text-sm uppercase tracking-widest text-muted-foreground">
              / {RECRUITMENT_GOAL}
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted border border-border/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-tan transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-2">
            {remaining > 0 ? `${remaining} more to arm the vault` : "Vault armed — countdown incoming"}
          </p>
        </div>

        <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-5" />

        {subscribed ? (
          <p className="font-stamp text-xs uppercase tracking-widest text-tan flex items-center justify-center gap-2">
            <Bell className="h-3.5 w-3.5 text-primary" /> You signed the list
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <label
              htmlFor="recruit-email"
              className="block font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              Drop your email to claim a spot
            </label>
            <div className="flex gap-2">
              <input
                id="recruit-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 min-w-0 px-3 py-2 bg-muted border border-border text-foreground text-sm font-stamp placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={submitting}
                className="shrink-0 px-3 sm:px-4 py-2 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-[10px] sm:text-xs tracking-widest shadow-[var(--shadow-outlaw)] transition-smooth flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Target className="h-3.5 w-3.5" />
                {submitting ? "Signing…" : "Sign On"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
