import { useCallback, useEffect, useMemo, useRef, useState, memo, type CSSProperties } from "react";
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
import { Check, Volume2, VolumeX, Swords } from "lucide-react";
import { CheckoutSheet } from "./CheckoutSheet";
import {
  isMuted,
  toggleMuted,
  subscribe as subscribeMute,
  leverPull as sfxLeverPull,
  reelStop as sfxReelStop,
  jackpotSting as sfxJackpotSting,
  startWhir as sfxStartWhir,
  stopWhir as sfxStopWhir,
  jarDrop as sfxJarDrop,
  doorOpen as sfxDoorOpen,
  duel as sfxDuel,
  vibrate,
} from "@/lib/slot-sfx";

type Pull = { tier: Tier; strain: StrainConfig };
type DrawnJar = Pull & { id: string };

const SPIN_MS = 1100;
const STAGGER_MS = 450;
// Extra "...will it be the Reserve?" beat tacked onto the final reel when the
// board is already hot (an EXO or Reserve has landed on an earlier reel).
const ANTICIPATION_MS = 800;
// Card art is 1920x1080 (16:9) — keep windows landscape so the art never mushes.
const REEL_WINDOW = "aspect-[16/9] w-full";
const REEL_STRIP = 14;

/** Rarity rank — Reserve (jackpot) beats EXO beats AAA. Used to find the best
 *  landed tier and to decide when to dramatize the final reel. */
const TIER_RANK: Record<Tier, number> = { EXCLUSIVE: 3, EXO: 2, AAA: 1 };

function bestTier(tiers: Tier[]): Tier {
  return tiers.reduce((best, t) => (TIER_RANK[t] > TIER_RANK[best] ? t : best), tiers[0]);
}

/** Auto-dismiss windows per celebration tier (ms). */
const CELEBRATION_MS: Record<Tier, number> = { EXCLUSIVE: 2400, EXO: 1800, AAA: 1200 };

type CSSVars = CSSProperties & Record<string, string | number>;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Two saloon doors swinging open over a reel (start of a fresh run). */
function SaloonDoors() {
  const slats =
    "bg-[repeating-linear-gradient(180deg,transparent_0,transparent_9px,hsl(0_0%_0%/0.4)_10px,transparent_11px)]";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 [transform-style:preserve-3d]">
      <div className="absolute inset-y-0 left-0 w-1/2 origin-left animate-door-left rounded-l-lg border-r border-black/50 bg-[linear-gradient(90deg,hsl(28_30%_21%),hsl(28_28%_12%))] shadow-[inset_-8px_0_14px_hsl(0_0%_0%/0.55)]">
        <div className={cn("absolute inset-0 opacity-30", slats)} />
      </div>
      <div className="absolute inset-y-0 right-0 w-1/2 origin-right animate-door-right rounded-r-lg border-l border-black/50 bg-[linear-gradient(270deg,hsl(28_30%_21%),hsl(28_28%_12%))] shadow-[inset_8px_0_14px_hsl(0_0%_0%/0.55)]">
        <div className={cn("absolute inset-0 opacity-30", slats)} />
      </div>
    </div>
  );
}

/** CSS/SVG desert-sunset + saloon scene that sits behind the gold bezel so the
 *  machine reads like it's set in a place. Pure CSS/SVG, no image files. */
function BanditScene() {
  const embers = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        left: `${8 + i * 13}%`,
        dur: `${12 + (i % 4) * 3}s`,
        delay: `${(i * 1.7).toFixed(1)}s`,
        x: `${(i % 2 ? 1 : -1) * (12 + i * 4)}px`,
        size: 2 + (i % 3),
      })),
    [],
  );
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 -top-12 -bottom-4 overflow-hidden rounded-[2rem] pointer-events-none opacity-70"
    >
      {/* Sunset: deep red -> amber -> black */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(0_45%_7%),hsl(10_55%_15%)_34%,hsl(30_72%_30%)_52%,hsl(24_45%_12%)_68%,hsl(0_0%_4%))]" />
      {/* Low sun glow on the horizon */}
      <div className="absolute inset-x-0 top-1/4 h-1/2 bg-[radial-gradient(circle_at_50%_42%,hsl(40_90%_58%/0.45),transparent_55%)]" />
      {/* Horizon line */}
      <div className="absolute left-0 right-0 top-[58%] h-px bg-[hsl(36_50%_55%/0.35)]" />
      {/* Silhouette: saloon roofline + a lone bare tree + a cactus */}
      <svg
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[46%] w-full text-[hsl(0_0%_3%)]"
      >
        <path
          fill="currentColor"
          d="M0 140 L0 132 L400 132 L400 140 Z
             M12 132 L12 86 L120 86 L120 132 Z
             M6 86 L6 66 L126 66 L126 86 Z
             M30 66 L66 46 L102 66 Z
             M100 66 L100 54 L108 54 L108 66 Z
             M318 132 L318 92 L324 92 L324 132 Z"
        />
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M321 98 L304 80 M321 102 L339 82 M321 90 L313 71 M321 88 L331 68" />
        </g>
        {/* saguaro cactus */}
        <path
          fill="currentColor"
          d="M214 132 L214 104 Q214 100 218 100 Q222 100 222 104 L222 132 Z
             M214 116 Q206 116 206 108 L206 100 Q206 97 208 97 Q210 97 210 100 L210 110 Q210 112 214 112 Z
             M222 114 Q230 114 230 106 L230 99 Q230 96 232 96 Q234 96 234 99 L234 108 Q234 110 222 110 Z"
        />
      </svg>
      {/* Drifting embers for parallax depth (reuses animate-ember) */}
      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-[40%] rounded-full bg-[hsl(38_80%_60%/0.7)] animate-ember"
          style={
            {
              left: e.left,
              width: `${e.size}px`,
              height: `${e.size}px`,
              "--ember-x": e.x,
              "--ember-dur": e.dur,
              "--ember-delay": e.delay,
            } as CSSVars
          }
        />
      ))}
    </div>
  );
}

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
  const isExo = tier === "EXO";
  const resultArt = result ? strainArt(result.strain.code) : undefined;

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden",
        REEL_WINDOW,
        "ring-1 ring-[hsl(var(--gold)/0.45)]",
        "bg-[radial-gradient(ellipse_at_center,hsl(0_0%_11%),hsl(0_0%_4%))]",
        "shadow-[inset_0_3px_16px_hsl(0_0%_0%/0.85)]",
        // EXO reads a notch above AAA with a static premium gold ring.
        isExo && "ring-1 ring-[hsl(var(--gold)/0.75)]",
        // Reserve: static bright ring (kept under reduced motion) + animated rim.
        isJackpot && "ring-2 ring-[hsl(var(--gold-bright))] animate-gold-border",
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
          {/* Reserve: holographic foil sheen. Hidden under reduced motion. */}
          {isJackpot && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
              <div className="absolute inset-y-0 -left-1/4 w-1/2 mix-blend-screen animate-foil-sheen bg-[linear-gradient(110deg,transparent,hsl(45_92%_82%/0.55),hsl(180_70%_78%/0.4),hsl(290_70%_80%/0.4),transparent)]" />
            </div>
          )}
          {/* EXO: subtler gold shimmer. Hidden under reduced motion. */}
          {isExo && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
              <div className="absolute inset-0 opacity-50 animate-gold-shimmer" />
            </div>
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

/** A picked jar in the haul — a selectable thumbnail with the rarity foil tell
 *  and a free, once-per-run Duel re-roll action. */
const PickCard = memo(function PickCard({
  jar,
  selected,
  dueling,
  canDuel,
  onToggle,
  onDuel,
}: {
  jar: DrawnJar;
  selected: boolean;
  dueling: boolean;
  canDuel: boolean;
  onToggle: (id: string) => void;
  onDuel: (id: string) => void;
}) {
  const art = strainArt(jar.strain.code);
  const isJackpot = jar.tier === JACKPOT_TIER;
  const isExo = jar.tier === "EXO";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(jar.id)}
        aria-pressed={selected}
        aria-label={`${selected ? "Remove" : "Keep"} ${jar.strain.name}`}
        className={cn(
          "group relative block w-full rounded-lg overflow-hidden text-left transition-all focus-outlaw",
          selected
            ? "ring-2 ring-[hsl(var(--gold-bright))] shadow-[var(--shadow-gold)]"
            : "ring-1 ring-border opacity-55 hover:opacity-90",
          isExo && !selected && "ring-1 ring-[hsl(var(--gold)/0.75)]",
          isJackpot && selected && "animate-gold-border",
        )}
      >
        <div
          className={cn(
            "relative",
            REEL_WINDOW,
            "bg-[radial-gradient(ellipse_at_center,hsl(0_0%_11%),hsl(0_0%_4%))]",
            dueling && "animate-duel-flip",
          )}
        >
          {art ? (
            <img src={art} alt={jar.strain.name} className="h-full w-full object-cover scale-105" draggable={false} />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center font-outlaw text-foreground text-sm leading-tight">
              {jar.strain.name}
            </div>
          )}
          {!selected && <div className="absolute inset-0 bg-background/45" />}
          {/* Rarity foil tell — consistent with the reels. */}
          {isJackpot && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
              <div className="absolute inset-y-0 -left-1/4 w-1/2 mix-blend-screen animate-foil-sheen bg-[linear-gradient(110deg,transparent,hsl(45_92%_82%/0.55),hsl(180_70%_78%/0.4),hsl(290_70%_80%/0.4),transparent)]" />
            </div>
          )}
          {isExo && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
              <div className="absolute inset-0 opacity-50 animate-gold-shimmer" />
            </div>
          )}
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

      {/* Free, once-per-run Duel re-roll. Never costs money. */}
      {canDuel && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuel(jar.id);
          }}
          aria-label={`Duel — re-draw ${jar.strain.name} (free, once per run)`}
          title="Duel this cut — free re-draw (once per run)"
          className="absolute top-1.5 left-1.5 z-10 grid place-items-center h-6 w-6 rounded-sm border border-[hsl(var(--gold)/0.6)] bg-background/80 text-gold hover:text-[hsl(var(--gold-bright))] hover:border-[hsl(var(--gold-bright))] transition-colors focus-outlaw"
        >
          <Swords className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
});

/** Escalating win celebration overlay, keyed on the best tier landed in a spin.
 *  Rendered inside the machine container. AAA/EXO are non-blocking (pointer
 *  passes through to the pick step); Reserve is a dismissible full takeover. */
const Celebration = memo(function Celebration({
  tier,
  reduced,
  onDismiss,
}: {
  tier: Tier;
  reduced: boolean;
  onDismiss: () => void;
}) {
  const isReserve = tier === JACKPOT_TIER;
  const isExo = tier === "EXO";
  const showParticles = !reduced && (isReserve || isExo);

  const particles = useMemo(() => {
    if (!showParticles) return [];
    const count = isReserve ? 18 : 10;
    return Array.from({ length: count }, () => {
      const ang = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * (isReserve ? 150 : 90);
      return {
        x: `${(Math.cos(ang) * dist).toFixed(1)}px`,
        y: `${(Math.sin(ang) * dist - 30).toFixed(1)}px`,
        delay: `${(Math.random() * 0.14).toFixed(3)}s`,
        size: 4 + Math.round(Math.random() * 4),
      };
    });
  }, [showParticles, isReserve]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 flex items-center justify-center overflow-hidden animate-celebration-in",
        isReserve ? "pointer-events-auto cursor-pointer" : "pointer-events-none",
      )}
      role="status"
      aria-live="assertive"
      aria-label={
        isReserve
          ? "Reserve cut — the jackpot. Added to your haul."
          : isExo
          ? "EXO cut landed. Added to your haul."
          : "AAA cut landed. Added to your haul."
      }
      onClick={isReserve ? onDismiss : undefined}
    >
      {/* Backdrop only dims for the full Reserve takeover */}
      {isReserve && <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]" />}

      {/* Gold glint sweep (all tiers) */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-[hsl(var(--gold-bright)/0.5)] to-transparent animate-glint-sweep" />
      </div>

      {/* Ember burst (EXO + Reserve) */}
      {showParticles && (
        <div aria-hidden className="absolute left-1/2 top-1/2">
          {particles.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[hsl(var(--gold-bright))] shadow-[0_0_8px_hsl(var(--gold)/0.8)] animate-ember-burst"
              style={
                {
                  "--bx": p.x,
                  "--by": p.y,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDelay: p.delay,
                } as CSSVars
              }
            />
          ))}
        </div>
      )}

      {/* Banner content */}
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        {isReserve ? (
          <>
            <div className="animate-stamp-slam border-[3px] border-[hsl(var(--primary))] bg-background/85 px-5 py-1.5 shadow-[var(--shadow-outlaw)]">
              <span className="font-outlaw text-4xl sm:text-5xl tracking-wider text-[hsl(var(--gold-bright))] text-shadow-outlaw">
                WANTED
              </span>
            </div>
            <div className="animate-ribbon-in bg-gold-plate text-background font-stamp uppercase text-[10px] sm:text-xs tracking-[0.25em] px-4 py-1.5 rounded-sm shadow-[var(--shadow-gold)]">
              Reserve Cut — Dead or Alive
            </div>
            <span className="font-stamp text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              Tap to continue
            </span>
          </>
        ) : isExo ? (
          <div className="animate-ribbon-in bg-gold-plate text-background font-stamp uppercase text-[10px] sm:text-xs tracking-[0.25em] px-4 py-1.5 rounded-sm shadow-[var(--shadow-gold)]">
            EXO Cut — Heavy Hitter
          </div>
        ) : (
          <div className="bg-background/85 border border-[hsl(var(--tan)/0.5)] text-tan font-stamp uppercase text-[10px] tracking-[0.25em] px-3 py-1 rounded-sm">
            AAA — Bagged
          </div>
        )}
      </div>
    </div>
  );
});

function MuteToggle() {
  const [muted, setMutedState] = useState<boolean>(() => isMuted());
  useEffect(() => subscribeMute(setMutedState), []);
  return (
    <button
      type="button"
      onClick={() => toggleMuted()}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      title={muted ? "Sound off" : "Sound on"}
      className="shrink-0 grid place-items-center h-7 w-7 rounded-sm border border-[hsl(var(--gold)/0.5)] bg-background/60 text-gold hover:text-[hsl(var(--gold-bright))] hover:border-[hsl(var(--gold-bright))] transition-colors focus-outlaw"
    >
      {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
    </button>
  );
}

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
  const [anticipating, setAnticipating] = useState(false);
  const [celebration, setCelebration] = useState<Tier | null>(null);
  const [doorsOpening, setDoorsOpening] = useState(false);
  const [rerollUsed, setRerollUsed] = useState(false);
  const [rerollingId, setRerollingId] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const timers = useRef<number[]>([]);
  const celebrationTimer = useRef<number | null>(null);

  const dismissCelebration = useCallback(() => {
    if (celebrationTimer.current) {
      clearTimeout(celebrationTimer.current);
      celebrationTimer.current = null;
    }
    setCelebration(null);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
      sfxStopWhir();
    },
    [],
  );

  const spinsLeft = SPINS_PER_RUN - spinsUsed;
  const exhausted = spinsLeft <= 0;
  const soldOut = available != null && available.size === 0;

  const pull = useCallback(() => {
    if (spinning || exhausted || soldOut) return;
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    dismissCelebration();
    setAnticipating(false);

    sfxLeverPull();
    sfxStartWhir();
    vibrate(18);

    // Saloon-door reveal on the first pull of a fresh run (reels spin behind the
    // doors, so it adds drama without delaying the spin).
    if (spinsUsed === 0 && !reduced) {
      sfxDoorOpen();
      setDoorsOpening(true);
      const td = window.setTimeout(() => setDoorsOpening(false), 650);
      timers.current.push(td);
    }

    setSpinning(true);
    setResults(Array(JARS_PER_PULL).fill(null));
    const draws: Pull[] = Array.from({ length: JARS_PER_PULL }, () => drawJar(available));

    const lastIdx = draws.length - 1;
    // "Hot" board: an EXO or Reserve already showed on an earlier reel, so the
    // final reel gets a tense beat (we never fake the result — just the reveal).
    const hot = draws.slice(0, lastIdx).some((d) => TIER_RANK[d.tier] >= TIER_RANK.EXO);

    if (hot) {
      const tAnt = window.setTimeout(
        () => setAnticipating(true),
        SPIN_MS + (lastIdx - 1) * STAGGER_MS + 140,
      );
      timers.current.push(tAnt);
    }

    draws.forEach((d, i) => {
      const isLast = i === lastIdx;
      const landAt = SPIN_MS + i * STAGGER_MS + (isLast && hot ? ANTICIPATION_MS : 0);
      const t = window.setTimeout(() => {
        setResults((prev) => {
          const next = [...prev];
          next[i] = d;
          return next;
        });
        sfxReelStop();
        vibrate(10);
        if (isLast) {
          setSpinning(false);
          setAnticipating(false);
          sfxStopWhir();
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
          // Loot-tray "clink" as each jar settles, staggered with the drop anim.
          newJars.forEach((_, k) => {
            const tc = window.setTimeout(() => sfxJarDrop(), 60 + k * 110);
            timers.current.push(tc);
          });

          // Celebrate, escalating by the best tier landed this spin.
          const best = bestTier(draws.map((x) => x.tier));
          if (best === JACKPOT_TIER) {
            sfxJackpotSting();
            vibrate([0, 60, 40, 120]);
            toast.success("Reserve Cut — Dead or Alive", {
              description: "The jackpot. Added to your haul.",
            });
          } else if (best === "EXO") {
            toast.success("EXO Cut — heavy hitter.", { description: "Added to your haul." });
          } else {
            toast("AAA cut — bagged.", { description: "Added to your haul." });
          }
          setCelebration(best);
          if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
          celebrationTimer.current = window.setTimeout(() => {
            setCelebration(null);
            celebrationTimer.current = null;
          }, CELEBRATION_MS[best]);
        }
      }, landAt);
      timers.current.push(t);
    });
  }, [spinning, exhausted, soldOut, available, dismissCelebration, spinsUsed, reduced]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Free, once-per-run Duel re-roll: swap a single jar for a fresh draw. Never
  // costs money, never "buys more chances" — a one-shot mulligan per run.
  const duelReroll = useCallback(
    (id: string) => {
      if (rerollUsed || spinning) return;
      setRerollUsed(true); // consume immediately so it stays one-per-run
      setRerollingId(id);
      sfxDuel();
      vibrate(14);
      const fresh = drawJar(available);
      // Swap mid-flip so the card visibly "turns over" to the new cut.
      const tSwap = window.setTimeout(() => {
        setDrawn((prev) =>
          prev.map((j) => (j.id === id ? { ...j, tier: fresh.tier, strain: fresh.strain } : j)),
        );
        setSelected((prev) => {
          const next = new Set(prev);
          next.add(id); // keep it, like any freshly dealt jar
          return next;
        });
        sfxJarDrop();
        vibrate(10);
      }, 250);
      const tEnd = window.setTimeout(() => setRerollingId(null), 540);
      timers.current.push(tSwap, tEnd);
    },
    [rerollUsed, spinning, available],
  );

  const selectedJars = drawn.filter((j) => selected.has(j.id));
  const cartPaid = selectedJars.length * WILDCARD_PRICE;
  const canDuel = drawn.length > 0 && !rerollUsed && !spinning;

  const resetRun = () => {
    setDrawn([]);
    setSelected(new Set());
    setSpinsUsed(0);
    setResults(Array(JARS_PER_PULL).fill(null));
    setRerollUsed(false);
    setRerollingId(null);
  };

  const checkout = () => {
    if (selectedJars.length === 0) return;
    setCheckingOut(true);
  };

  return (
    <div className="relative mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl">
      <BanditScene />
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
        <div
          className={cn(
            "relative grain overflow-hidden rounded-[15px] bg-[radial-gradient(ellipse_at_50%_-10%,hsl(0_32%_12%),hsl(0_0%_6%)_62%)] p-4 sm:p-6 md:p-8",
            celebration === JACKPOT_TIER && !reduced && "animate-screen-shake",
          )}
        >
          {celebration && (
            <Celebration tier={celebration} reduced={reduced} onDismiss={dismissCelebration} />
          )}
          {/* Brass rivets */}
          {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
            <span key={pos} className={cn("absolute h-2 w-2 rounded-full bg-gold-plate shadow-[inset_0_1px_1px_hsl(45_90%_85%),0_1px_2px_hsl(0_0%_0%/0.6)]", pos)} aria-hidden />
          ))}

          <div className="flex items-center justify-between mb-4">
            <span className="font-stamp text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold">The One-Armed Bandit</span>
            <div className="flex items-center gap-2">
              <span className="font-stamp text-[10px] sm:text-xs uppercase tracking-[0.3em] text-background bg-gold-plate px-2 py-0.5 rounded-sm shadow-[var(--shadow-gold)]">${WILDCARD_PRICE} / jar</span>
              <MuteToggle />
            </div>
          </div>

          {/* Reels + lever */}
          <div className="flex items-stretch gap-2 sm:gap-3 md:gap-4 mb-5">
            <div className="flex-1 grid gap-2 sm:gap-3 md:gap-4" style={{ gridTemplateColumns: `repeat(${JARS_PER_PULL}, minmax(0, 1fr))` }}>
              {results.map((r, i) => {
                const isLast = i === results.length - 1;
                return (
                  <div
                    key={i}
                    className={cn(
                      "relative rounded-lg transition-opacity duration-300",
                      anticipating && !isLast && "opacity-40",
                      anticipating && isLast && "z-10 animate-anticipation-pulse",
                    )}
                    style={doorsOpening ? ({ perspective: "600px" } as CSSProperties) : undefined}
                  >
                    <Reel spinning={spinning} result={r} />
                    {doorsOpening && <SaloonDoors />}
                  </div>
                );
              })}
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
                  anticipating
                    ? "animate-tremble"
                    : spinning
                    ? "animate-lever-pull"
                    : "transition-transform group-hover/lever:translate-y-2 motion-reduce:transform-none",
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
              <div className="flex items-center justify-between mb-3 gap-3">
                <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-tan">
                  Your Haul — Keep What You Want
                </p>
                <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground shrink-0">
                  {selectedJars.length}/{drawn.length} kept
                </p>
              </div>

              {canDuel && (
                <p className="mb-3 font-stamp text-[9px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  One free duel this run — re-draw a cut you don't love.
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-5">
                {drawn.map((j, idx) => (
                  <div
                    key={j.id}
                    className={reduced ? undefined : "animate-jar-drop"}
                    style={
                      reduced
                        ? undefined
                        : ({ animationDelay: `${(idx % JARS_PER_PULL) * 0.09}s` } as CSSProperties)
                    }
                  >
                    <PickCard
                      jar={j}
                      selected={selected.has(j.id)}
                      dueling={rerollingId === j.id}
                      canDuel={canDuel}
                      onToggle={toggle}
                      onDuel={duelReroll}
                    />
                  </div>
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
