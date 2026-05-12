import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "mw_vault_tour_seen";

const STEPS = [
  {
    title: "01 · The Vault",
    body: "Each square is one sealed jar. 64 in total. No reprints, no restocks.",
  },
  {
    title: "02 · Peek The Pedigree",
    body: "Hover any square to peek the tier and price. The variant stays sealed until your door.",
  },
  {
    title: "03 · Claim Your Spot",
    body: "Tap to reserve a square on the wanted list. Pay nothing now — we just hold your seat.",
  },
];

interface Props {
  /** Only show the tour on routes where the grid is mounted. */
  enabled?: boolean;
}

export const VaultTour = ({ enabled = true }: Props) => {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Defer to next tick so the grid mounts under it
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, [enabled]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  };

  if (!open) return null;
  const current = STEPS[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-tour-title"
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 sm:p-6 animate-reveal"
    >
      <button
        aria-label="Close walkthrough"
        onClick={dismiss}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md border border-primary/50 bg-card shadow-[var(--shadow-outlaw)] p-6">
        <button
          onClick={dismiss}
          aria-label="Skip walkthrough"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 focus-outlaw"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan mb-3">
          — Walkthrough —
        </p>
        <h3 id="vault-tour-title" className="font-outlaw text-2xl text-foreground text-shadow-outlaw mb-2">
          {current.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {current.body}
        </p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={
                  "h-1.5 w-6 transition-colors " +
                  (i <= step ? "bg-primary" : "bg-muted")
                }
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={dismiss}
              className="px-3 py-1.5 font-stamp uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground focus-outlaw"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="px-3 py-1.5 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-[10px] tracking-widest shadow-[var(--shadow-outlaw)] focus-outlaw"
            >
              {step < STEPS.length - 1 ? "Next" : "Got It"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
