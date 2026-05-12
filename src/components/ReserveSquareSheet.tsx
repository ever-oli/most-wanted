import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Square, TIERS } from "@/lib/drop-config";
import { Eye, X } from "lucide-react";

interface Props {
  square: Square | null;
  onClose: () => void;
  onReserved: (idx: number) => void;
}

/**
 * Pre-drop "tap to reserve" inline form.
 * Re-uses the wanted-list-signup edge function with an optional square_index.
 */
export const ReserveSquareSheet = ({ square, onClose, onReserved }: Props) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!square) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [square, onClose]);

  if (!square) return null;
  const tier = TIERS[square.tier];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "wanted-list-signup",
        {
          body: {
            email: trimmed,
            square_index: square.index,
            phone: smsOptIn ? phone.trim() : undefined,
          },
        }
      );
      if (error || !data?.ok) {
        toast.error("Could not reserve. Try again.");
        return;
      }
      toast.success(
        data.duplicate
          ? `You're already on the wanted list — square #${square.index + 1} noted.`
          : `Square #${square.index + 1} reserved on the wanted list.`,
        { description: "We'll ping you the second the vault arms." }
      );
      try {
        const raw = localStorage.getItem("mw_reserved_squares");
        const list: number[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(square.index)) list.push(square.index);
        localStorage.setItem("mw_reserved_squares", JSON.stringify(list));
      } catch {
        /* ignore */
      }
      onReserved(square.index);
      onClose();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reserve-title"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md border border-primary/50 bg-card shadow-[var(--shadow-outlaw)] p-6">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 focus-outlaw"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan mb-2 flex items-center gap-2">
          <Eye className="h-3 w-3" /> — Reserve The Spot —
        </p>
        <h3 id="reserve-title" className="font-outlaw text-2xl text-foreground text-shadow-outlaw mb-1">
          Square #{square.index + 1}
        </h3>
        <p className="font-stamp text-xs uppercase tracking-widest text-muted-foreground mb-4">
          {tier.label} · ${tier.price} · {tier.weight} · locks at drop
        </p>

        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          We'll hold your spot on the wanted list. Pay nothing now — when the vault arms,
          you get first crack at this square.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full px-3 py-2 bg-muted border border-border text-foreground text-sm font-stamp placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
          />

          <label className="flex items-start gap-2 text-[11px] font-stamp uppercase tracking-wider text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <span>
              Text me tracking + drop alerts
              <span className="block text-[10px] normal-case tracking-normal text-muted-foreground/70">
                Standard rates apply. We never sell your number.
              </span>
            </span>
          </label>

          {smsOptIn && (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 bg-muted border border-border text-foreground text-sm font-stamp placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2.5 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-xs tracking-widest shadow-[var(--shadow-outlaw)] transition-smooth focus-outlaw disabled:opacity-60"
          >
            {submitting ? "Reserving…" : "Reserve Square"}
          </button>
        </form>
      </div>
    </div>
  );
};
