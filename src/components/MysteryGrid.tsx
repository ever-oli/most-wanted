import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  JARS_PER_PULL,
  SPINS_PER_RUN,
  WILDCARD_PRICE,
  TIERS,
  DROP_LIVE,
  DROP_NAME,
  DROP_SUBTITLE,
  RECRUITMENT_MODE,
  type Tier,
} from "@/lib/drop-config";
import { VaultCountdown } from "./VaultCountdown";
import { SlotMachine } from "./SlotMachine";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

/**
 * The Vault — the One-Armed Bandit. Every pull wins a sealed jar; the tier and
 * strain are the gamble. When the drop is sealed, the machine is shown locked
 * (blurred) behind a countdown; recruitment sign-up lives above the vault.
 */
export const MysteryGrid = () => {
  const showCountdown = !DROP_LIVE && !RECRUITMENT_MODE;

  // Reactive per-tier stock from Convex (drives sold-out treatment).
  const inventory = useQuery(api.inventory.summary);
  const remainingByTier = useMemo(() => {
    const m: Record<Tier, number> = { EXCLUSIVE: 0, EXO: 0, AAA: 0 };
    if (inventory) for (const r of inventory) m[r.tier as Tier] = (m[r.tier as Tier] ?? 0) + r.remaining;
    return m;
  }, [inventory]);
  const totalRemaining = inventory ? inventory.reduce((s, r) => s + r.remaining, 0) : null;
  const allSoldOut = totalRemaining === 0;

  return (
    <section id="vault" className="relative scroll-mt-24">
      <div className="container py-12 md:py-16">
        <div className="text-center mb-8">
          <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— {DROP_NAME} —</p>
          <h2 className="font-outlaw text-3xl sm:text-4xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
            Pull the <span className="text-primary">Lever</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto font-stamp italic">
            {DROP_SUBTITLE}
          </p>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Every spin deals {JARS_PER_PULL} sealed cuts. Take your {SPINS_PER_RUN} spins, then keep only the jars you want.
          </p>
          <p className="mt-2 text-foreground text-sm md:text-base max-w-lg mx-auto font-semibold">
            One flat ${WILDCARD_PRICE} a jar — for cuts worth $70 to $100.
          </p>

          {/* Tier / worth legend — with live remaining stock */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-stamp uppercase tracking-widest">
            {Object.values(TIERS).map((t) => {
              const remaining = remainingByTier[t.id];
              const soldOut = inventory != null && remaining === 0;
              return (
                <span
                  key={t.id}
                  className={cn(
                    "px-3 py-1.5 border bg-card flex items-center gap-2",
                    soldOut ? "border-destructive/40 opacity-60" : "border-border",
                  )}
                >
                  <span className={cn("h-2.5 w-2.5", t.colorClass, soldOut && "opacity-40")} /> {t.label} · worth ${t.price}
                  {inventory != null && (
                    <span className={cn("ml-1", soldOut ? "text-destructive" : "text-muted-foreground/70")}>
                      {soldOut ? "· Sold Out" : `· ${remaining} left`}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          <p className="mt-3 font-stamp text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 max-w-md mx-auto">
            Reserve — the rarest, most exclusive cut. Land it and the jackpot lights up.
          </p>
        </div>

        {DROP_LIVE ? (
          allSoldOut ? (
            // Whole drop is gone.
            <div className="mx-auto max-w-xl rounded-2xl p-[2px] bg-gold-plate shadow-[var(--shadow-gold),var(--shadow-deep)]">
              <div className="rounded-[15px] grain bg-[radial-gradient(ellipse_at_50%_-10%,hsl(0_32%_12%),hsl(0_0%_6%)_62%)] p-8 text-center">
                <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan mb-2">— Vault Empty —</p>
                <h3 className="font-outlaw text-3xl text-primary text-shadow-outlaw mb-2">Sold Out</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Every jar in this drop is spoken for. Get on the wanted list for the next one.
                </p>
                <a
                  href="/review"
                  className="mt-5 inline-block px-5 py-2.5 border border-primary/60 text-foreground font-stamp uppercase text-xs tracking-widest hover:bg-primary/10 transition-smooth focus-outlaw"
                >
                  Rate Your Jar
                </a>
              </div>
            </div>
          ) : (
            <SlotMachine />
          )
        ) : (
          // Sealed: show the bandit locked behind a countdown / recruitment cue.
          <div className="relative mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl">
            <div className="pointer-events-none select-none blur-sm opacity-50" aria-hidden>
              <SlotMachine />
            </div>
            {showCountdown ? (
              <VaultCountdown />
            ) : (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
                <div className="relative z-20 text-center px-6 py-8 border border-primary/50 bg-card/95 shadow-[var(--shadow-outlaw)] rounded-lg max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 mb-3">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    <span className="font-stamp text-[10px] uppercase tracking-[0.25em] text-tan">Sealed</span>
                  </div>
                  <h3 className="font-outlaw text-xl md:text-2xl text-foreground text-shadow-outlaw mb-2">
                    The Bandit Is Locked
                  </h3>
                  <p className="font-stamp text-xs text-muted-foreground italic">
                    Sign the wanted list above to arm the vault.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
