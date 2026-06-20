import {
  JARS_PER_PULL,
  SPINS_PER_RUN,
  WILDCARD_PRICE,
  TIERS,
  DROP_LIVE as CONFIG_DROP_LIVE,
  DROP_NAME,
  DROP_SUBTITLE,
  RECRUITMENT_MODE as CONFIG_RECRUITMENT_MODE,
} from "@/lib/drop-config";
import { VaultCountdown } from "./VaultCountdown";
import { SlotMachine } from "./SlotMachine";
import { useDemoMode } from "@/lib/demo-mode";
import { Lock } from "lucide-react";

/**
 * The Vault — the One-Armed Bandit. Every pull wins a sealed jar; the tier and
 * strain are the gamble. When the drop is sealed, the machine is shown locked
 * (blurred) behind a countdown; recruitment sign-up lives above the vault.
 */
export const MysteryGrid = () => {
  const demo = useDemoMode();
  const DROP_LIVE = demo.active ? demo.dropLive : CONFIG_DROP_LIVE;
  const RECRUITMENT_MODE = demo.active ? demo.recruitmentMode : CONFIG_RECRUITMENT_MODE;
  const showCountdown = !DROP_LIVE && !RECRUITMENT_MODE;

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
            One flat ${WILDCARD_PRICE} a jar — for cuts worth $70 to $110.
          </p>

          {/* Tier / worth legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-stamp uppercase tracking-widest">
            {Object.values(TIERS).map((t) => (
              <span key={t.id} className="px-3 py-1.5 border border-border bg-card flex items-center gap-2">
                <span className={`h-2.5 w-2.5 ${t.colorClass}`} /> {t.label} · worth ${t.price}
              </span>
            ))}
          </div>
          <p className="mt-3 font-stamp text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 max-w-md mx-auto">
            F&amp;F = Friends &amp; Family — our exclusive cut. Land it and the jackpot lights up.
          </p>
        </div>

        {DROP_LIVE ? (
          <SlotMachine />
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
