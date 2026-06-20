import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { toast } from "sonner";
import {
  MAX_PER_PULL,
  PULL_CART_MAX,
  RESERVATION_SECONDS,
  WILDCARD_PRICE,
  STRAINS,
  TIERS,
  JACKPOT_TIER,
  drawJar,
  strainArt,
  type StrainConfig,
  type Tier,
} from "@/lib/drop-config";
import { cn } from "@/lib/utils";
import { useDemoMode } from "@/lib/demo-mode";
import { Clock, X } from "lucide-react";

type Pull = { tier: Tier; strain: StrainConfig };
type CartJar = Pull & { id: string; expiresAt: number };

const SPIN_MS = 1100;
const STAGGER_MS = 450;
// Card art is 1920x1080 (16:9) — keep windows landscape so the art never mushes.
const REEL_WINDOW = "aspect-[16/9] w-full";
const REEL_STRIP = 14;

function fmt(secs: number) {
  const s = Math.max(0, secs);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** A single luxe reel: a vertically scrolling strip of card art while spinning,
 *  snapping to the won jar on stop. Memoized so the per-second cart countdown
 *  never re-renders the reels. */
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

export function SlotMachine() {
  const demo = useDemoMode();
  const [pulls, setPulls] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<(Pull | null)[]>([null]);
  const [cart, setCart] = useState<CartJar[]>([]);
  const [now, setNow] = useState(Date.now());
  const [checkedOut, setCheckedOut] = useState<CartJar[] | null>(null);
  const timers = useRef<number[]>([]);
  const cartRef = useRef<CartJar[]>([]);
  cartRef.current = cart;

  const remaining = PULL_CART_MAX - cart.length;
  const maxPullable = Math.min(MAX_PER_PULL, Math.max(1, remaining));

  // Keep chosen pull count within capacity.
  useEffect(() => {
    if (pulls > maxPullable) setPulls(maxPullable);
  }, [pulls, maxPullable]);

  // Reel windows reflect the next/last spin size while idle.
  useEffect(() => {
    if (!spinning) setResults((prev) => (prev.length === pulls ? prev : Array(pulls).fill(null)));
  }, [pulls, spinning]);

  // One-second tick: drive countdowns and expire held jars back to the pool.
  // Only runs while jars are held, so an idle machine never re-renders.
  useEffect(() => {
    if (cart.length === 0) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      const expired = cartRef.current.filter((j) => j.expiresAt <= t);
      if (expired.length) {
        setCart((prev) => prev.filter((j) => j.expiresAt > t));
        toast(`${expired.length} jar${expired.length > 1 ? "s" : ""} returned to the pool`, {
          description: "Reservation expired — pull again to chase it.",
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cart.length]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const pull = useCallback(() => {
    if (spinning || remaining <= 0) return;
    const n = Math.min(pulls, remaining);
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];

    setSpinning(true);
    setResults(Array(n).fill(null));
    const draws: Pull[] = Array.from({ length: n }, () => drawJar());

    draws.forEach((d, i) => {
      const t = window.setTimeout(() => {
        setResults((prev) => {
          const next = [...prev];
          next[i] = d;
          return next;
        });
        if (i === draws.length - 1) {
          setSpinning(false);
          const expiresAt = Date.now() + RESERVATION_SECONDS * 1000;
          setCart((prev) => [
            ...prev,
            ...draws.map((j, k) => ({ ...j, id: `${Date.now()}-${k}-${Math.random().toString(36).slice(2, 7)}`, expiresAt })),
          ]);
          if (draws.some((x) => x.tier === JACKPOT_TIER)) {
            toast.success("JACKPOT — Exclusive Cut!", { description: "Held in your cart. Lock it in before the timer runs out." });
          } else {
            toast.success(`${draws.length} jar${draws.length > 1 ? "s" : ""} held`, { description: `Reserved in your cart for ${fmt(RESERVATION_SECONDS)}.` });
          }
        }
      }, SPIN_MS + i * STAGGER_MS);
      timers.current.push(t);
    });
  }, [pulls, remaining, spinning]);

  const removeJar = (id: string) => setCart((prev) => prev.filter((j) => j.id !== id));

  const cartPaid = cart.length * WILDCARD_PRICE;
  const cartValue = cart.reduce((s, j) => s + TIERS[j.tier].price, 0);

  const checkout = () => {
    if (cart.length === 0) return;
    if (demo.demoCheckout) {
      setCheckedOut(cart);
      setCart([]);
    } else {
      toast("Routing to checkout…", { description: "Payments wire up next." });
    }
  };

  // ===== Post-checkout success (demo) =====
  if (checkedOut) {
    const paid = checkedOut.length * WILDCARD_PRICE;
    const value = checkedOut.reduce((s, j) => s + TIERS[j.tier].price, 0);
    return (
      <div className="mx-auto max-w-xl rounded-2xl p-[2px] sm:p-[3px] bg-gold-plate shadow-[var(--shadow-gold),var(--shadow-deep)] animate-reveal">
      <div className="rounded-[15px] grain bg-[radial-gradient(ellipse_at_50%_-10%,hsl(0_32%_12%),hsl(0_0%_6%)_62%)] p-6 text-center">
        <p className="font-outlaw text-3xl text-primary text-shadow-outlaw mb-1">Locked In.</p>
        <p className="text-muted-foreground text-sm mb-4">
          {checkedOut.length} jar{checkedOut.length > 1 ? "s" : ""} secured · Paid ${paid}
          {value > paid && <span className="text-tier-exclusive"> · ${value} in value 🤠</span>}
        </p>
        <div className="space-y-1.5 mb-5 max-w-xs mx-auto text-left">
          {checkedOut.map((w) => (
            <div key={w.id} className="flex items-center justify-between font-stamp uppercase text-xs">
              <span className="flex items-center gap-2">
                <span className={cn("h-2 w-2", TIERS[w.tier].colorClass)} /> {w.strain.name}
              </span>
              <span className={TIERS[w.tier].textClass}>{TIERS[w.tier].label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setCheckedOut(null)}
          className="px-5 py-2.5 border border-primary/60 text-foreground font-stamp uppercase text-xs tracking-widest hover:bg-primary/10 transition-smooth focus-outlaw"
        >
          Back to the Machine
        </button>
        <p className="mt-3 font-stamp text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60">Demo · No charge</p>
      </div>
      </div>
    );
  }

  const full = remaining <= 0;

  return (
    <div className="relative mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl">
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
            <span className="font-stamp text-[10px] sm:text-xs uppercase tracking-[0.3em] text-background bg-gold-plate px-2 py-0.5 rounded-sm shadow-[var(--shadow-gold)]">${WILDCARD_PRICE} / pull</span>
          </div>

          {/* Reels + lever */}
          <div className="flex items-stretch gap-2 sm:gap-3 md:gap-4 mb-5">
            <div className="flex-1 grid gap-2 sm:gap-3 md:gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(1, results.length)}, minmax(0, 1fr))` }}>
              {results.map((r, i) => (
                <Reel key={i} spinning={spinning} result={r} />
              ))}
            </div>

            {/* Brass side lever (decorative + pulls) */}
            <button
              onClick={pull}
              disabled={spinning || full}
              aria-label={`Pull the lever · $${WILDCARD_PRICE * pulls}`}
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

          {/* Quantity */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-stamp text-[10px] uppercase tracking-[0.2em] text-muted-foreground mr-1">Pull</span>
            {Array.from({ length: MAX_PER_PULL }, (_, n) => n + 1).map((n) => (
              <button
                key={n}
                onClick={() => !spinning && n <= maxPullable && setPulls(n)}
                disabled={spinning || n > maxPullable}
                className={cn(
                  "h-8 w-8 rounded-sm border font-stamp text-sm transition-smooth focus-outlaw disabled:opacity-30",
                  pulls === n
                    ? "border-transparent bg-gold-plate text-background shadow-[var(--shadow-gold)]"
                    : "border-[hsl(var(--gold)/0.4)] text-tan hover:text-foreground hover:border-[hsl(var(--gold)/0.7)]",
                )}
                aria-pressed={pulls === n}
                aria-label={`${n} jar${n > 1 ? "s" : ""}`}
              >
                {n}
              </button>
            ))}
            <span className="font-stamp text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">
              {full ? "cart full" : `jar${pulls > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Pull plate */}
          <button
            onClick={pull}
            disabled={spinning || full}
            className={cn(
              "relative w-full py-4 rounded-md font-outlaw text-xl tracking-wider transition-all duration-300 flex items-center justify-center gap-3 focus-outlaw overflow-hidden",
              "border",
              spinning || full
                ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                : "bg-primary text-primary-foreground border-[hsl(var(--gold)/0.6)] hover:bg-primary-glow shadow-[var(--shadow-outlaw)]",
            )}
          >
            {!spinning && !full && <span aria-hidden className="absolute inset-0 animate-gold-shimmer motion-reduce:hidden" />}
            <span className="relative">
              {spinning ? "Spinning…" : full ? "Cart Full — Lock It In" : `Pull the Lever · $${WILDCARD_PRICE * pulls}`}
            </span>
          </button>

        {/* Cart of held jars with reservation countdowns */}
        {cart.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-tan">Held in Your Cart</p>
              <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{cart.length}/{PULL_CART_MAX}</p>
            </div>
            <div className="space-y-2 mb-4">
              {cart.map((j) => {
                const left = Math.round((j.expiresAt - now) / 1000);
                const urgent = left <= 60;
                return (
                  <div key={j.id} className="flex items-center justify-between gap-2 text-xs font-stamp uppercase border border-border/60 bg-background/50 px-2.5 py-1.5">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={cn("h-2 w-2 shrink-0", TIERS[j.tier].colorClass)} />
                      <span className="truncate">{j.strain.name}</span>
                      <span className={cn("shrink-0 text-[10px]", TIERS[j.tier].textClass)}>{TIERS[j.tier].label}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className={cn("flex items-center gap-1 tabular-nums", urgent ? "text-destructive animate-pulse" : "text-muted-foreground")}>
                        <Clock className="h-3 w-3" /> {fmt(left)}
                      </span>
                      <button onClick={() => removeJar(j.id)} className="text-muted-foreground/70 hover:text-destructive focus-outlaw" aria-label="Release jar">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={checkout}
              className="w-full py-3 rounded-md bg-gold-plate text-background font-stamp uppercase text-xs tracking-widest hover:brightness-110 transition-smooth focus-outlaw shadow-[var(--shadow-gold)]"
            >
              Lock It In · ${cartPaid}
              {cartValue > cartPaid && <span className="opacity-70"> · ${cartValue} value</span>}
            </button>
          </div>
        )}
        </div>
      </div>

      <p className="mt-4 text-center font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
        Every pull wins a jar · Held {fmt(RESERVATION_SECONDS)} · The cut is the gamble
      </p>
    </div>
  );
}
