import { Square, TIERS, DROP_NAME } from "@/lib/drop-config";
import { useMemo } from "react";

interface Props {
  open: boolean;
  selected: number[];
  grid: Square[];
  onClose: () => void;
  onHuntAgain: () => void;
}

export const DemoCheckoutSuccess = ({ open, selected, grid, onClose, onHuntAgain }: Props) => {
  const orderId = useMemo(
    () => "MW-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-" + Date.now().toString().slice(-4),
    [open]
  );
  if (!open) return null;
  const total = selected.reduce((s, i) => s + TIERS[grid[i].tier].price, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md border-2 border-primary/60 bg-card shadow-[var(--shadow-deep)]">
        {/* corner stamps */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-tan" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-tan" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-tan" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-tan" />

        <div className="p-7">
          <div className="text-center mb-5">
            <p className="font-stamp text-[10px] uppercase tracking-[0.35em] text-tan mb-2">— {DROP_NAME} —</p>
            <div className="inline-block border-2 border-primary px-4 py-1.5 -rotate-2 mb-3">
              <p className="font-outlaw text-2xl text-primary text-shadow-outlaw">ORDER LOCKED</p>
            </div>
            <p className="font-stamp text-xs uppercase tracking-widest text-muted-foreground">
              Order #{orderId}
            </p>
          </div>

          <div className="border-t border-b border-border/60 py-4 space-y-2 mb-5">
            {selected.map((i) => {
              const sq = grid[i];
              const tier = TIERS[sq.tier];
              return (
                <div key={i} className="flex items-center justify-between font-stamp uppercase text-xs">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 ${sq.tier === "EXO" ? "bg-tier-exo" : "bg-tier-aaa"}`} />
                    Square #{i + 1} · {sq.tier}
                  </span>
                  <span className="text-tan">${tier.price}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-5">
            <span className="font-stamp uppercase text-xs tracking-widest text-muted-foreground">Total</span>
            <span className="font-outlaw text-2xl text-foreground">${total}</span>
          </div>

          <p className="text-center text-[11px] font-stamp uppercase tracking-widest text-tan/80 mb-5">
            ★ Sealed. Shipping soon. ★<br />
            <span className="text-muted-foreground normal-case tracking-normal text-xs">
              A confirmation has been sent to your inbox.
            </span>
          </p>

          <div className="flex gap-2">
            <button
              onClick={onHuntAgain}
              className="flex-1 px-4 py-2.5 border border-border bg-muted hover:bg-muted-foreground/20 text-foreground font-stamp uppercase text-xs tracking-widest transition-smooth focus-outlaw"
            >
              Hunt Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-xs tracking-widest shadow-[var(--shadow-outlaw)] transition-smooth focus-outlaw"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
