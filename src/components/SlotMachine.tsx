import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  WILDCARD_PRICE,
  SPINS_PER_RUN,
  JARS_PER_PULL,
  STRAINS,
  TIERS,
  JACKPOT_TIER,
  drawJar,
  strainArt,
  type StrainConfig,
  type Tier,
} from "@/lib/drop-config";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { CheckoutSheet } from "./CheckoutSheet";

type Pull = { tier: Tier; strain: StrainConfig };
type DrawnJar = Pull & { id: string };

const SPIN_MS = 1100;
const STAGGER_MS = 450;
// Card art is 1920x1080 (16:9) — keep windows landscape so the art never mushes.
const REEL_WINDOW = "aspect-[16/9] w-full";
const REEL_STRIP = 14;

/** A single luxe reel: a vertically scrolling strip of card art while spinning,
 *  snapping to the won jar on stop. Memoized so unrelated re-renders (picks
 *  selection, etc.) never re-render a spinning reel. */
const Reel = memo(function Reel({ spinning, result }: { spinning: boolean; result: Pull | null }) {
  // A fresh randomized strip each time a spin begins (drives the scroll illusion).
  const strip = useMemo(
    () => Array.from({ length: REEL_STRIP }, () => STRAINS[Math.floor(Math.random() * STRAINS.length)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spinning],
  );

  const tier = spinning ? null : result?.tier ?? null;
  const isJackpot = tier === JACKPOT_TIER;
  const resultArt = result ? strainArt(result.strain.code) : undefined;

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden",
        REEL_WINDOW,
        "ring-1 ring-[hsl(var(--gold)/0.45)]",
        "bg-[radial-gradient(ellipse_at_center,hsl(0_0%_11%),hsl(0_0%_4%))]",
        "shadow-[inset_0_3px_16px_hsl(0_0%_0%/0.85)]",
        isJackpot && "ring-2 ring-[hsl(var(--gold-bright))] animate-pulse-red",
      )}
    >
      {spinning ? (
        // Spinning: duplicated strip scrolling upward, motion-blurred.
        <div className="absolute inset-0">
          <div className="animate-reel-spin will-change-transform blur-[2.5px]">
            {[...strip, ...strip].map((s, i) => {
              const a = strainArt(s.code);
              return (
                <div key={i} className={REEL_WINDOW}>
                  {a ? (
                    <img src={a} alt="" className="h-full w-full object-cover scale-105 opacity-90" draggable={false} />
                  ) : (
                    <div className="flex h-full items-center justify-center font-outlaw text-tan/40 text-xl">{s.name}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : result ? (
        // Landed result.
        <div className="absolute inset-0 animate-reel-land">
          {resultArt ? (
            <img src={resultArt} alt={result.strain.name} className="h-full w-full object-cover scale-105" draggable={false} />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center font-outlaw text-foreground text-base leading-tight">
              {result.strain.name}
            </div>
          )}
          {tier && (
            <span
              className={cn(
                "absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] sm:text-[9px] font-stamp uppercase tracking-[0.2em] border bg-background/85 backdrop-blur-sm",
                TIERS[tier].borderClass,
                TIERS[tier].textClass,
              )}
            >
              {TIERS[tier].label}
            </span>
          )}
          {isJackpot && (
            <span className="absolute top-1.5 left-1/2 -translate-x-1/2 font-stamp text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-[hsl(var(--gold-bright))] bg-background/85 backdrop-blur-sm px-2 py-0.5 rounded-sm">
              ★ Jackpot ★
            </span>
          )}
        </div>
      ) : (
        // Idle window.
        <div className="absolute inset-0 flex items-center justify-center font-outlaw text-4xl text-[hsl(var(--gold)/0.35)]">★</div>
      )}

      {/* Glass gloss + payline overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[hsl(var(--gold)/0.4)]" />
      </div>
    </div>
  );
});

/** A picked jar in the haul — a selectable thumbnail. */
const PickCard = memo(function PickCard({
  jar,
  selected,
  onToggle,
}: {
  jar: DrawnJar;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const art = strainArt(jar.strain.code);
  const isJackpot = jar.tier === JACKPOT_TIER;
  return (
    <button
      type="button"
      onClick={() => onToggle(jar.id)}
      aria-pressed={selected}
      aria-label={`${selected ? "Remove" : "Keep"} ${jar.strain.name}`}
      className={cn(
        "group relative rounded-lg overflow-hidden text-left transition-all focus-outlaw",
        selected
          ? "ring-2 ring-[hsl(var(--gold-bright))] shadow-[var(--shadow-gold)]"
          : "ring-1 ring-border opacity-55 hover:opacity-90",
        isJackpot && selected && "animate-pulse-red",
      )}
    >
      <div className={cn("relative", REEL_WINDOW, "bg-[radial-gradient(ellipse_at_center,hsl(0_0%_11%),hsl(0_0%_4%))]")}>
        {art ? (
          <img src={art} alt={jar.strain.name} className="h-full w-full object-cover scale-105" draggable={false} />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center font-outlaw text-foreground text-sm leading-tight">
            {jar.strain.name}
          </div>
        )}
        {!selected && <div className="absolute inset-0 bg-background/45" />}
        {/* Keep/skip indicator */}
        <span
          className={cn(
            "absolute top-1.5 right-1.5 h-5 w-5 rounded-full flex items-center justify-center border",
            selected
              ? "bg-gold-plate border-[hsl(var(--gold-bright))] text-background"
              : "bg-background/70 border-border text-transparent",
          )}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        <span
          className={cn(
            "absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-stamp uppercase tracking-[0.18em] border bg-background/85 backdrop-blur-sm",
            TIERS[jar.tier].borderClass,
            TIERS[jar.tier].textClass,
          )}
        >
          {TIERS[jar.tier].label}
        </span>
      </div>
      <div className="px-2 py-1.5 bg-card/60">
        <p className="font-stamp uppercase text-[10px] tracking-wider text-foreground truncate">{jar.strain.name}</p>
      </div>
    </button>
  );
});

export function SlotMachine() {
  const inventory = useQuery(api.inventory.summary);
  const available = useMemo(
    () => (inventory ? new Set(inventory.filter((r) => r.remaining > 0).map((r) => r.code)) : undefined),
    [inventory],
  );
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<(Pull | null)[]>(Array(JARS_PER_PULL).fill(null));
  const [drawn, setDrawn] = useState<DrawnJar[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const spinsLeft = SPINS_PER_RUN - spinsUsed;
  const exhausted = spinsLeft <= 0;
  const soldOut = available != null && available.size === 0;

  const pull = useCallback(() => {
    if (spinning || exhausted || soldOut) return;
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];

    setSpinning(true);
    setResults(Array(JARS_PER_PULL).fill(null));
    const draws: Pull[] = Array.from({ length: JARS_PER_PULL }, () => drawJar(available));

    draws.forEach((d, i) => {
      const t = window.setTimeout(() => {
        setResults((prev) => {
          const next = [...prev];
          next[i] = d;
          return next;
        });
        if (i === draws.length - 1) {
          setSpinning(false);
          setSpinsUsed((n) => n + 1);
          const newJars: DrawnJar[] = draws.map((j, k) => ({
            ...j,
            id: `${Date.now()}-${k}-${Math.random().toString(36).slice(2, 7)}`,
          }));
          setDrawn((prev) => [...prev, ...newJars]);
          // New jars start kept — pick-and-choose by removing what you don't want.
          setSelected((prev) => {
            const next = new Set(prev);
            newJars.forEach((j) => next.add(j.id));
            return next;
          });
          if (draws.some((x) => x.tier === JACKPOT_TIER)) {
            toast.success("JACKPOT — Exclusive Cut!", { description: "Added to your haul. Keep it in the cart." });
          }
        }
      }, SPIN_MS + i * STAGGER_MS);
      timers.current.push(t);
    });
  }, [spinning, exhausted, soldOut, available]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedJars = drawn.filter((j) => selected.has(j.id));
  const cartPaid = selectedJars.length * WILDCARD_PRICE;

  const resetRun = () => {
    setDrawn([]);
    setSelected(new Set());
    setSpinsUsed(0);
    setResults(Array(JARS_PER_PULL).fill(null));
  };

  const checkout = () => {
    if (selectedJars.length === 0) return;
    setCheckingOut(true);
  };

  return (
    <div className="relative mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl">
      {checkingOut && (
        <CheckoutSheet
          items={selectedJars.map((j) => ({ code: j.strain.code, name: j.strain.name, tier: j.tier }))}
          onClose={() => setCheckingOut(false)}
          onPlaced={resetRun}
        />
      )}
      {/* Warm ambient glow */}
      <div className="absolute -inset-6 bg-[radial-gradient(ellipse_at_center,hsl(41_70%_45%/0.12),transparent_70%)] blur-2xl pointer-events-none" />

      {/* Gold bezel */}
      <div className="relative rounded-2xl p-[2px] sm:p-[3px] bg-gold-plate shadow-[var(--shadow-gold),var(--shadow-deep)]">
        {/* Inner panel */}
        <div className="relative grain overflow-hidden rounded-[15px] bg-[radial-gradient(ellipse_at_50%_-10%,hsl(0_32%_12%),hsl(0_0%_6%)_62%)] p-4 sm:p-6 md:p-8">
          {/* Brass rivets */}
          {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
            <span key={pos} className={cn("absolute h-2 w-2 rounded-full bg-gold-plate shadow-[inset_0_1px_1px_hsl(45_90%_85%),0_1px_2px_hsl(0_0%_0%/0.6)]", pos)} aria-hidden />
          ))}

          <div className="flex items-center justify-between mb-4">
            <span className="font-stamp text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold">The One-Armed Bandit</span>
            <span className="font-stamp text-[10px] sm:text-xs uppercase tracking-[0.3em] text-background bg-gold-plate px-2 py-0.5 rounded-sm shadow-[var(--shadow-gold)]">${WILDCARD_PRICE} / jar</span>
          </div>

          {/* Reels + lever */}
          <div className="flex items-stretch gap-2 sm:gap-3 md:gap-4 mb-5">
            <div className="flex-1 grid gap-2 sm:gap-3 md:gap-4" style={{ gridTemplateColumns: `repeat(${JARS_PER_PULL}, minmax(0, 1fr))` }}>
              {results.map((r, i) => (
                <Reel key={i} spinning={spinning} result={r} />
              ))}
            </div>

            {/* Brass side lever (decorative + pulls) */}
            <button
              onClick={pull}
              disabled={spinning || exhausted || soldOut}
              aria-label={soldOut ? "Sold out" : exhausted ? "All spins used" : `Pull the lever · ${JARS_PER_PULL} jars`}
              className="hidden sm:flex shrink-0 w-9 md:w-11 relative focus-outlaw disabled:opacity-40 group/lever"
            >
              <span aria-hidden className="absolute left-1/2 top-1 bottom-1 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-[hsl(var(--gold-deep))] via-black/40 to-[hsl(var(--gold-deep))]" />
              <span
                aria-hidden
                className={cn(
                  "absolute left-1/2 top-1 -translate-x-1/2 h-9 w-9 md:h-11 md:w-11 rounded-full bg-gold-plate border border-[hsl(var(--gold-bright))] shadow-[var(--shadow-gold)]",
                  "after:content-[''] after:absolute after:inset-1 after:rounded-full after:bg-[radial-gradient(circle_at_35%_30%,hsl(45_90%_85%),transparent_60%)]",
                  spinning ? "animate-lever-pull" : "transition-transform group-hover/lever:translate-y-2 motion-reduce:transform-none",
                )}
              />
            </button>
          </div>

          {/* Spins remaining */}
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <span className="font-stamp text-[10px] uppercase tracking-[0.2em] text-muted-foreground mr-1">Spins</span>
            {Array.from({ length: SPINS_PER_RUN }, (_, n) => n).map((n) => (
              <span
                key={n}
                aria-hidden
                className={cn(
                  "h-2.5 w-2.5 rounded-full border transition-colors",
                  n < spinsUsed
                    ? "bg-gold-plate border-[hsl(var(--gold-bright))] shadow-[var(--shadow-gold)]"
                    : "border-[hsl(var(--gold)/0.45)] bg-transparent",
                )}
              />
            ))}
            <span className="font-stamp text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">
              {exhausted ? "all used" : `${spinsLeft} left`}
            </span>
          </div>

          {/* Pull plate */}
          <button
            onClick={pull}
            disabled={spinning || exhausted || soldOut}
            className={cn(
              "relative w-full py-4 rounded-md font-outlaw text-xl tracking-wider transition-all duration-300 flex items-center justify-center gap-3 focus-outlaw overflow-hidden",
              "border",
              spinning || exhausted || soldOut
                ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                : "bg-primary text-primary-foreground border-[hsl(var(--gold)/0.6)] hover:bg-primary-glow shadow-[var(--shadow-outlaw)]",
            )}
          >
            {!spinning && !exhausted && !soldOut && <span aria-hidden className="absolute inset-0 animate-gold-shimmer motion-reduce:hidden" />}
            <span className="relative">
              {soldOut
                ? "Sold Out"
                : spinning
                ? "Spinning…"
                : exhausted
                ? "All Spins Used — Pick Your Jars"
                : `Pull the Lever · Spin ${spinsUsed + 1} of ${SPINS_PER_RUN}`}
            </span>
          </button>

          {/* The haul — pick & choose which jars to buy */}
          {drawn.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-tan">
                  Your Haul — Keep What You Want
                </p>
                <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {selectedJars.length}/{drawn.length} kept
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-5">
                {drawn.map((j) => (
                  <PickCard key={j.id} jar={j} selected={selected.has(j.id)} onToggle={toggle} />
                ))}
              </div>

              <button
                onClick={checkout}
                disabled={selectedJars.length === 0}
                className="w-full py-3 rounded-md bg-gold-plate text-background font-stamp uppercase text-xs tracking-widest hover:brightness-110 transition-smooth focus-outlaw shadow-[var(--shadow-gold)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedJars.length === 0 ? (
                  "Tap Jars to Keep Them"
                ) : (
                  <>
                    Lock In {selectedJars.length} Jar{selectedJars.length > 1 ? "s" : ""} · ${cartPaid}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
        {JARS_PER_PULL} jars a spin · {SPINS_PER_RUN} spins · Buy only the cuts you keep
      </p>
    </div>
  );
}
