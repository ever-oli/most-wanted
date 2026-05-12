import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { GRID_SIZE, MAX_CART_TOTAL, Square, Tier, TIERS, buildGrid, DEMO_SOLD_INDEXES, DROP_LIVE as CONFIG_DROP_LIVE, DROP_NAME, DROP_SUBTITLE, GOLDEN_SQUARES, RECRUITMENT_MODE as CONFIG_RECRUITMENT_MODE } from "@/lib/drop-config";
import { cn } from "@/lib/utils";
import { CheckoutSheet } from "./CheckoutSheet";
import { VaultCountdown } from "./VaultCountdown";
import { WantedListRecruitment } from "./WantedListRecruitment";
import { PosterFrame } from "./PosterFrame";
import { DemoCheckoutSuccess } from "./DemoCheckoutSuccess";
import { VaultTour } from "./VaultTour";
import { VaultTicker } from "./VaultTicker";
import { ReserveSquareSheet } from "./ReserveSquareSheet";
import { useDemoMode } from "@/lib/demo-mode";
import { Lock, Eye } from "lucide-react";

interface Props {
  onAllSold?: () => void;
}

/* ===== Memoized square: only re-renders when its own state changes ===== */
interface SquareProps {
  sq: Square;
  isSelected: boolean;
  isRevealed: boolean;
  isReserved: boolean;
  previewMode: boolean;
  onTap: (sq: Square) => void;
  onHover: (idx: number) => void;
  focused: boolean;
}

import React from "react";

const GridSquare = React.memo(
  ({ sq, isSelected, isRevealed, isReserved, previewMode, onTap, onHover, focused, isGolden }: SquareProps & { isGolden: boolean }) => {
    const tierColor = sq.tier === "EXO" ? "bg-tier-exo" : "bg-tier-aaa";
    return (
      <button
        data-index={sq.index}
        onClick={() => onTap(sq)}
        onMouseEnter={() => {
          if (!sq.sold) onHover(sq.index);
        }}
        disabled={sq.sold}
        tabIndex={focused ? 0 : -1}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className={cn(
          "group/tile peer/tile relative aspect-square text-[8px] sm:text-[10px] font-stamp uppercase font-bold transition-smooth select-none focus-outlaw touch-manipulation",
          "border border-border/60 active:scale-[0.92] motion-reduce:active:scale-100",
          sq.sold && "bg-sold text-foreground/40 cursor-not-allowed border-border active:scale-100",
          !sq.sold && !isRevealed && "bg-muted hover:bg-muted-foreground/20 text-transparent",
          !sq.sold && isRevealed && !previewMode && tierColor + " text-background hover:brightness-110",
          !sq.sold && isRevealed && previewMode && "bg-muted/60 hover:bg-muted text-foreground/70 border-tan/40",
          isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background animate-pulse-red motion-reduce:animate-none",
          isReserved && !sq.sold && "ring-1 ring-tan/60",
          isGolden && !sq.sold && "shadow-[0_0_12px_hsl(var(--tan)/0.4)] border-tan/60"
        )}
        aria-label={
          sq.sold
            ? `Square ${sq.index + 1} sold`
            : `Square ${sq.index + 1}, tier ${sq.tier}, $${TIERS[sq.tier].price}${isGolden ? ', golden square' : ''}${previewMode ? ', tap to reserve' : ''}`
        }
        aria-pressed={isSelected}
      >
        {sq.sold ? (
          <span className="block leading-none animate-sold-stamp motion-reduce:animate-none">
            SOLD
          </span>
        ) : isRevealed ? (
          <span className="block leading-none">{sq.tier}</span>
        ) : (
          <span className="block leading-none text-foreground/60">{sq.index + 1}</span>
        )}

        {/* Reserved (pre-drop) marker */}
        {isReserved && !sq.sold && (
          <span className="absolute bottom-0.5 right-0.5 text-tan text-[8px] leading-none">👁</span>
        )}

        {/* Golden indicator */}
        {isGolden && !sq.sold && (
          <span className="absolute top-0.5 right-0.5 h-1 w-1 bg-tan rounded-full" />
        )}

        {/* Hover tooltip */}
        {!sq.sold && isRevealed && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-background border border-tan/40 text-[9px] tracking-wider text-foreground whitespace-nowrap opacity-0 group-hover/tile:opacity-100 transition-opacity pointer-events-none z-20 hidden sm:block shadow-[0_4px_12px_hsl(0_0%_0%/0.6)]">
            {sq.tier} · ${TIERS[sq.tier].price}{isGolden ? ' · ★' : ''}{previewMode ? ' · locks at drop' : ''}
          </span>
        )}
      </button>
    );
  }
);
GridSquare.displayName = "GridSquare";

export const MysteryGrid = ({ onAllSold }: Props) => {
  const demo = useDemoMode();
  const DROP_LIVE = demo.active ? demo.dropLive : CONFIG_DROP_LIVE;
  const RECRUITMENT_MODE = demo.active ? demo.recruitmentMode : CONFIG_RECRUITMENT_MODE;
  const [demoSuccessOpen, setDemoSuccessOpen] = useState(false);
  const grid: Square[] = useMemo(() => buildGrid(DEMO_SOLD_INDEXES), []);
  const [selected, setSelected] = useState<number[]>([]);
  const [activeSquare, setActiveSquare] = useState<Square | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [limitError, setLimitError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const allSold = grid.every((s) => s.sold);
  if (allSold) onAllSold?.();

  const tierCounts = selected.reduce(
    (acc, idx) => {
      const t = grid[idx].tier;
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    },
    {} as Record<Tier, number>
  );

  const soldCount = grid.filter((s) => s.sold).length;
  const claimedCount = soldCount + selected.length;
  const progressPct = Math.min((claimedCount / grid.length) * 100, 100);

  const handleTap = useCallback(
    (sq: Square) => {
      if (sq.sold) return;
      if (!revealed.has(sq.index)) {
        setRevealed((prev) => new Set(prev).add(sq.index));
        return;
      }
      setActiveSquare(sq);
    },
    [revealed]
  );

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
      });
      return;
    }
    if ((tierCounts[sq.tier] ?? 0) >= TIERS[sq.tier].maxPerOrder) {
      const msg = `Max ${TIERS[sq.tier].maxPerOrder} ${sq.tier} squares per order.`;
      setLimitError(msg);
      toast.error(msg, {
        description: "Reach out for wholesale services.",
      });
      return;
    }
    setLimitError(null);
    setSelected((prev) => [...prev, sq.index]);
    setActiveSquare(null);
    toast.success(`${sq.tier} square locked in.`, {
      description: `Square #${sq.index + 1} • $${TIERS[sq.tier].price}`,
    });
  };

  const removeFromCart = (idx: number) => {
    setSelected((prev) => prev.filter((i) => i !== idx));
    setLimitError(null);
  };

  const cartTotal = selected.reduce((sum, i) => sum + TIERS[grid[i].tier].price, 0);

  /* ===== Keyboard nav ===== */
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      if (!DROP_LIVE) return;
      const max = grid.length - 1;
      let next = focusedIndex;
      switch (e.key) {
        case "ArrowRight":
          next = Math.min(focusedIndex + 1, max);
          break;
        case "ArrowLeft":
          next = Math.max(focusedIndex - 1, 0);
          break;
        case "ArrowDown":
          next = Math.min(focusedIndex + GRID_SIZE, max);
          break;
        case "ArrowUp":
          next = Math.max(focusedIndex - GRID_SIZE, 0);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleTap(grid[focusedIndex]);
          return;
        default:
          return;
      }
      e.preventDefault();
      setFocusedIndex(next);
      const btn = el.querySelector<HTMLButtonElement>(`[data-index="${next}"]`);
      btn?.focus();
    };

    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [focusedIndex, grid, handleTap]);

  return (
    <section id="vault" className="relative scroll-mt-24">
      <div className="container py-12 md:py-16">
        <div className="text-center mb-8">
          <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— {DROP_NAME} —</p>
          <h2 className="font-outlaw text-3xl sm:text-4xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
            Pick Your <span className="text-primary">Square</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto font-stamp italic">
            {DROP_SUBTITLE}
          </p>
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

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mb-4">
          <div className="flex items-center justify-between mb-1.5 text-[10px] font-stamp uppercase tracking-widest text-muted-foreground">
            <span>{claimedCount} of {grid.length} Claimed</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted border border-border/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-tan transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Grid container */}
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 blur-2xl pointer-events-none" />
          <PosterFrame>
          <div className="relative border border-border bg-card/60 p-2 sm:p-3 shadow-[var(--shadow-deep)] overflow-x-auto scrollbar-outlaw cursor-crosshair-outlaw">
            <div
              ref={gridRef}
              tabIndex={0}
              className={cn(
                "grid gap-1 sm:gap-1.5 mx-auto relative focus-outlaw group",
                !DROP_LIVE && "blur-sm pointer-events-none select-none opacity-60"
              )}
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                minWidth: GRID_SIZE * 22,
              }}
              aria-label="Mystery grid. Use arrow keys to navigate, enter to select."
            >
              {grid.map((sq) => (
                <GridSquare
                  key={sq.index}
                  sq={sq}
                  isSelected={selected.includes(sq.index)}
                  isRevealed={revealed.has(sq.index) || selected.includes(sq.index)}
                  onTap={handleTap}
                  onHover={(idx) => setRevealed((p) => new Set(p).add(idx))}
                  focused={focusedIndex === sq.index}
                  isGolden={GOLDEN_SQUARES.includes(sq.index)}
                />
              ))}
            </div>

            {/* Countdown overlay when vault is sealed (recruitment lives above as its own section) */}
            {!DROP_LIVE && !RECRUITMENT_MODE && <VaultCountdown />}
            {!DROP_LIVE && RECRUITMENT_MODE && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-4 pointer-events-none">
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
                <p className="relative font-stamp uppercase text-[11px] tracking-[0.3em] text-tan/80 text-center">
                  ★ Vault Sealed ★<br />
                  <span className="text-[10px] text-muted-foreground">Sign the wanted list above to arm it</span>
                </p>
              </div>
            )}
          </div>
          </PosterFrame>
        </div>

        {/* Cart summary bar */}
        {selected.length > 0 && DROP_LIVE && (
          <div className="fixed bottom-0 inset-x-0 z-30 border-t border-primary/40 bg-background/95 backdrop-blur-md animate-cart-slide motion-reduce:animate-none">
            {limitError && (
              <div
                role="alert"
                aria-live="polite"
                className="container pt-2 -mb-1 flex items-center justify-between gap-3"
              >
                <p className="font-stamp uppercase text-[11px] tracking-widest text-destructive">
                  ⚠ {limitError}
                </p>
                <button
                  onClick={() => setLimitError(null)}
                  className="text-destructive/80 hover:text-destructive text-xs font-stamp uppercase tracking-widest focus-outlaw"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="container py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-outlaw">
                {selected.map((i) => (
                  <button
                    key={i}
                    onClick={() => removeFromCart(i)}
                    className="shrink-0 px-2.5 py-1 border border-primary/50 bg-card text-xs font-stamp uppercase hover:bg-primary/20 transition-smooth focus-outlaw"
                  >
                    {grid[i].tier} #{i + 1} ✕
                  </button>
                ))}
                <button
                  onClick={() => {
                    const squares = selected.map(i => `#${i + 1} (${grid[i].tier})`).join(', ');
                    const text = `Locked in: ${squares} — ${DROP_NAME}. The vault awaits.`;
                    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'));
                  }}
                  className="shrink-0 px-2 py-1 border border-border/60 text-[10px] font-stamp uppercase tracking-widest text-muted-foreground hover:text-foreground transition-smooth focus-outlaw"
                  aria-label="Share claimed squares"
                >
                  Share
                </button>
              </div>
              <button
                onClick={() => {
                  if (demo.demoCheckout) {
                    setDemoSuccessOpen(true);
                  } else {
                    toast("Routing to Shopify checkout…");
                  }
                }}
                className="shrink-0 px-4 py-2.5 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-xs tracking-widest shadow-[var(--shadow-outlaw)] transition-smooth focus-outlaw"
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

      <DemoCheckoutSuccess
        open={demoSuccessOpen}
        selected={selected}
        grid={grid}
        onClose={() => setDemoSuccessOpen(false)}
        onHuntAgain={() => {
          setDemoSuccessOpen(false);
          setSelected([]);
          setRevealed(new Set());
          setLimitError(null);
        }}
      />
    </section>
  );
};
