import { useCallback, useEffect, useRef, useState, memo } from "react";
import { toast } from "sonner";
import {
  MAX_PER_PULL,
  PULL_CART_MAX,
  RESERVATION_SECONDS,
  WILDCARD_PRICE,
  STRAINS,
  TIERS,
  drawJar,
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

function fmt(secs: number) {
  const s = Math.max(0, secs);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** A single reel: blurs + cycles strain names while spinning, lands on a jar.
 *  Memoized so the per-second cart countdown never re-renders the reels. */
const Reel = memo(function Reel({ spinning, result }: { spinning: boolean; result: Pull | null }) {
  const [ticker, setTicker] = useState<StrainConfig>(STRAINS[0]);

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => {
      setTicker(STRAINS[Math.floor(Math.random() * STRAINS.length)]);
    }, 70);
    return () => clearInterval(id);
  }, [spinning]);

  const show = spinning ? ticker : result?.strain ?? null;
  const tier = spinning ? null : result?.tier ?? null;
  const isJackpot = tier === "EXCLUSIVE";

  return (
    <div
      className={cn(
        "relative h-28 sm:h-32 rounded-md border-2 bg-background/90 overflow-hidden flex flex-col items-center justify-center text-center px-2",
        "shadow-[inset_0_2px_12px_hsl(0_0%_0%/0.7)]",
        spinning ? "border-tan/40" : tier ? TIERS[tier].borderClass : "border-border",
        isJackpot && "animate-pulse-red",
      )}
    >
      <div aria-hidden className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-px bg-tan/20" />
      {show ? (
        <div className={cn("transition-all duration-150", spinning && "blur-[1.5px] opacity-80 scale-95")}>
          {tier && (
            <span
              className={cn(
                "inline-block mb-1 px-1.5 py-0.5 text-[8px] font-stamp uppercase tracking-[0.2em] border",
                TIERS[tier].borderClass,
                TIERS[tier].textClass,
              )}
            >
              {tier}
            </span>
          )}
          <div className={cn("font-outlaw leading-tight text-foreground", show.name.length > 18 ? "text-sm" : "text-base")}>
            {show.name}
          </div>
        </div>
      ) : (
        <div className="font-outlaw text-3xl text-muted-foreground/40">?</div>
      )}
      {isJackpot && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-stamp text-[8px] uppercase tracking-[0.25em] text-tier-exclusive">
          ★ Jackpot ★
        </span>
      )}
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
          if (draws.some((x) => x.tier === "EXCLUSIVE")) {
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
      <div className="mx-auto max-w-xl text-center border-2 border-tan/50 bg-card/70 rounded-xl p-6 animate-reveal">
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
              <span className={TIERS[w.tier].textClass}>{w.tier}</span>
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
    );
  }

  const full = remaining <= 0;

  return (
    <div className="relative mx-auto max-w-xl">
      <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 blur-2xl pointer-events-none" />

      <div className="relative border-2 border-tan/50 bg-card/70 rounded-xl p-4 sm:p-6 shadow-[var(--shadow-deep)]">
        <div className="flex items-center justify-between mb-4">
          <span className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan">The One-Armed Bandit</span>
          <span className="font-stamp text-[10px] uppercase tracking-[0.3em] text-muted-foreground">${WILDCARD_PRICE} / pull</span>
        </div>

        {/* Reels */}
        <div className="grid gap-2 sm:gap-3 mb-5" style={{ gridTemplateColumns: `repeat(${Math.max(1, results.length)}, minmax(0, 1fr))` }}>
          {results.map((r, i) => (
            <Reel key={i} spinning={spinning} result={r} />
          ))}
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
                "h-8 w-8 border font-stamp text-sm transition-smooth focus-outlaw disabled:opacity-30",
                pulls === n ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
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

        {/* Lever / pull */}
        <button
          onClick={pull}
          disabled={spinning || full}
          className={cn(
            "w-full py-4 rounded font-outlaw text-xl tracking-wider transition-all duration-300 flex items-center justify-center gap-3 focus-outlaw",
            spinning || full
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-outlaw)] animate-pulse-red motion-reduce:animate-none",
          )}
        >
          {spinning ? "Spinning…" : full ? "Cart Full — Lock It In" : `Pull the Lever · $${WILDCARD_PRICE * pulls}`}
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
                      <span className={cn("shrink-0 text-[10px]", TIERS[j.tier].textClass)}>{j.tier}</span>
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
              className="w-full py-3 bg-tan text-background font-stamp uppercase text-xs tracking-widest hover:brightness-110 transition-smooth focus-outlaw"
            >
              Lock It In · ${cartPaid}
              {cartValue > cartPaid && <span className="opacity-70"> · ${cartValue} value</span>}
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-center font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
        Every pull wins a jar · Held {fmt(RESERVATION_SECONDS)} · The cut is the gamble
      </p>
    </div>
  );
}
