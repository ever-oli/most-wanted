import { useMemo, useState } from "react";
import { toast } from "sonner";
import { GRID_SIZE, MAX_CART_TOTAL, Square, Tier, TIERS, buildGrid, DEMO_SOLD_INDEXES, DROP_LIVE } from "@/lib/drop-config";
import { cn } from "@/lib/utils";
import { CheckoutSheet } from "./CheckoutSheet";
import { Lock } from "lucide-react";

interface Props {
  onAllSold?: () => void;
}

export const MysteryGrid = ({ onAllSold }: Props) => {
  const grid: Square[] = useMemo(() => buildGrid(DEMO_SOLD_INDEXES), []);
  const [selected, setSelected] = useState<number[]>([]);
  const [activeSquare, setActiveSquare] = useState<Square | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [limitError, setLimitError] = useState<string | null>(null);

  const allSold = grid.every((s) => s.sold);
  if (allSold) onAllSold?.();

  const tierCounts = selected.reduce(
    (acc, idx) => {
      const t = grid[idx].tier;
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    },
    {} as Record<Tier, number>,
  );

  const handleTap = (sq: Square) => {
    if (sq.sold) return;
    // Reveal on first tap (mobile), open sheet on second tap
    if (!revealed.has(sq.index)) {
      setRevealed((prev) => new Set(prev).add(sq.index));
      return;
    }
    setActiveSquare(sq);
  };

  const tryAddToCart = (sq: Square) => {
    if (selected.includes(sq.index)) {
      setActiveSquare(null);
      return;
    }
    if (selected.length >= MAX_CART_TOTAL) {
      const msg = `Max ${MAX_CART_TOTAL} squares per order. Remove one to add another.`;
      setLimitError(msg);
      toast.error("Limit reached. Leave some for the rest of the hunters.", {
        description: "Reach out for wholesale services.",
        className: "font-stamp",
      });
      return;
    }
    if ((tierCounts[sq.tier] ?? 0) >= TIERS[sq.tier].maxPerOrder) {
      const msg = `Max ${TIERS[sq.tier].maxPerOrder} ${sq.tier} squares per order.`;
      setLimitError(msg);
      toast.error(msg, {
        description: "Reach out for wholesale services.",
        className: "font-stamp",
      });
      return;
    }
    setLimitError(null);
    setSelected((prev) => [...prev, sq.index]);
    setActiveSquare(null);
    toast.success(`${sq.tier} square locked in.`, {
      description: `Square #${sq.index + 1} • $${TIERS[sq.tier].price}`,
      className: "font-stamp",
    });
  };

  const removeFromCart = (idx: number) => {
    setSelected((prev) => prev.filter((i) => i !== idx));
    setLimitError(null);
  };

  const cartTotal = selected.reduce((sum, i) => sum + TIERS[grid[i].tier].price, 0);
  const soldCount = grid.filter((s) => s.sold).length;

  return (
    <section className="relative">
      <div className="container py-12 md:py-16">
        <div className="text-center mb-8">
          <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— The Vault —</p>
          <h2 className="font-outlaw text-3xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
            Pick Your <span className="text-primary">Square</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Tap once to reveal the tier. Tap again to lock it in. Max {MAX_CART_TOTAL} per order.
          </p>

          {/* Legend / counts */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-stamp uppercase tracking-widest">
            <span className="px-3 py-1.5 border border-border bg-card flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-tier-exo" /> EXO · ${TIERS.EXO.price}
            </span>
            <span className="px-3 py-1.5 border border-border bg-card flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-tier-aaa" /> AAA · ${TIERS.AAA.price}
            </span>
            <span className="px-3 py-1.5 border border-border bg-card flex items-center gap-2 text-muted-foreground">
              <Lock className="h-3 w-3" /> {soldCount}/{grid.length} Sold
            </span>
          </div>
        </div>

        {/* Grid container — scrollable on mobile to keep squares tappable */}
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 blur-2xl pointer-events-none" />
          <div className="relative border border-border bg-card/60 p-2 sm:p-3 shadow-[var(--shadow-deep)] overflow-x-auto scrollbar-outlaw">
            <div
              className={cn(
                "grid gap-1 sm:gap-1.5 mx-auto relative",
                !DROP_LIVE && "blur-sm pointer-events-none select-none opacity-60"
              )}
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                minWidth: GRID_SIZE * 22,
              }}
            >
              {grid.map((sq) => {
                const isSelected = selected.includes(sq.index);
                const isRevealed = revealed.has(sq.index) || isSelected;
                const tierColor = sq.tier === "EXO" ? "bg-tier-exo" : "bg-tier-aaa";
                return (
                  <button
                    key={sq.index}
                    onClick={() => handleTap(sq)}
                    onMouseEnter={() => !sq.sold && setRevealed((p) => new Set(p).add(sq.index))}
                    disabled={sq.sold}
                    className={cn(
                      "relative aspect-square text-[8px] sm:text-[9px] font-stamp uppercase font-bold transition-smooth select-none",
                      "border border-border/60",
                      sq.sold && "bg-sold text-foreground/40 cursor-not-allowed border-border",
                      !sq.sold && !isRevealed && "bg-muted hover:bg-muted-foreground/20 text-transparent",
                      !sq.sold && isRevealed && tierColor + " text-background",
                      isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background animate-pulse-red",
                    )}
                    aria-label={sq.sold ? `Square ${sq.index + 1} sold` : `Square ${sq.index + 1}`}
                  >
                    {sq.sold ? (
                      <span className="block leading-none">SOLD</span>
                    ) : isRevealed ? (
                      <span className="block leading-none">{sq.tier}</span>
                    ) : (
                      <span className="block leading-none text-foreground/60">{sq.index + 1}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* WIP / Coming Soon overlay when vault is closed */}
            {!DROP_LIVE && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
                <div className="relative z-20 text-center px-6 py-8 border border-primary/50 bg-card/95 shadow-[var(--shadow-outlaw)] rounded-lg max-w-sm mx-auto">
                  <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— WIP —</p>
                  <h3 className="font-outlaw text-2xl md:text-3xl text-foreground text-shadow-outlaw mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-muted-foreground text-sm font-stamp">
                    The vault is sealed. Check back when the next drop goes live.
                  </p>
                  <div className="mt-4 h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart summary bar */}
        {selected.length > 0 && DROP_LIVE && (
          <div className="fixed bottom-0 inset-x-0 z-30 border-t border-primary/40 bg-background/95 backdrop-blur-md animate-reveal">
            <div className="container py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-outlaw">
                {selected.map((i) => (
                  <button
                    key={i}
                    onClick={() => removeFromCart(i)}
                    className="shrink-0 px-2.5 py-1 border border-primary/50 bg-card text-xs font-stamp uppercase hover:bg-primary/20 transition-smooth"
                  >
                    {grid[i].tier} #{i + 1} ✕
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  // Trigger Shopify Buy Button here
                  toast("Routing to Shopify checkout…", { className: "font-stamp" });
                }}
                className="shrink-0 px-4 py-2.5 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-xs tracking-widest shadow-[var(--shadow-outlaw)]"
              >
                Lock It In · ${cartTotal}
              </button>
            </div>
          </div>
        )}
      </div>

      {DROP_LIVE && (
        <CheckoutSheet
          square={activeSquare}
          onClose={() => setActiveSquare(null)}
          onConfirm={tryAddToCart}
          alreadyInCart={activeSquare ? selected.includes(activeSquare.index) : false}
        />
      )}
    </section>
  );
};
