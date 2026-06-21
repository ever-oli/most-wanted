import { useState } from "react";
import { ExternalLink, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  STRAINS,
  TIERS,
  GROWER_CODE,
  strainArt,
  strainDossier,
  type StrainConfig,
} from "@/lib/drop-config";
import { cn } from "@/lib/utils";

/** Reusable tier stamp — matches the slot-machine / vault badge conventions. */
const TierBadge = ({ tier, className }: { tier: StrainConfig["tier"]; className?: string }) => (
  <span
    className={cn(
      "px-1.5 py-0.5 text-[8px] sm:text-[9px] font-stamp uppercase tracking-[0.18em] border bg-background/85 backdrop-blur-sm",
      TIERS[tier].borderClass,
      TIERS[tier].textClass,
      className,
    )}
  >
    {TIERS[tier].label}
  </span>
);

/** A single label card in the lineup grid. */
const LineupCard = ({ strain, onOpen }: { strain: StrainConfig; onOpen: (s: StrainConfig) => void }) => {
  const art = strainArt(strain.code);
  return (
    <button
      type="button"
      onClick={() => onOpen(strain)}
      aria-label={`Open the ${strain.name} dossier`}
      className={cn(
        "group relative rounded-lg overflow-hidden text-left transition-all duration-300 focus-outlaw",
        "ring-1 ring-border bg-card/40",
        "hover:-translate-y-1 hover:ring-[hsl(var(--gold-bright))] hover:shadow-[var(--shadow-gold)] motion-reduce:hover:translate-y-0",
      )}
    >
      <div className="relative aspect-[16/9] bg-[radial-gradient(ellipse_at_center,hsl(0_0%_11%),hsl(0_0%_4%))]">
        {art ? (
          <img
            src={art}
            alt={`${strain.name} label`}
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover scale-105 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center font-outlaw text-foreground text-sm leading-tight">
            {strain.name}
          </div>
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <TierBadge tier={strain.tier} className="absolute bottom-1.5 left-1.5" />
      </div>
      <div className="px-2.5 py-2 border-t border-border/60">
        <p className="font-stamp uppercase text-[10px] sm:text-[11px] tracking-wider text-foreground truncate">
          {strain.name}
        </p>
      </div>
    </button>
  );
};

export const StrainLineup = () => {
  const [active, setActive] = useState<StrainConfig | null>(null);
  const dossier = active ? strainDossier(active.code) : undefined;
  const activeArt = active ? strainArt(active.code) : undefined;

  return (
    <section id="lineup" className="container py-16 md:py-20 scroll-mt-24">
      <div className="text-center mb-10 md:mb-12">
        <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— The Lineup —</p>
        <h2 className="font-outlaw text-3xl sm:text-4xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
          Ten Cuts On The <span className="text-primary">Sheet</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
          Ten cultivars run this drop — nine on the board and one Friends &amp; Family exclusive.
          Pull a label to open its dossier.
        </p>
      </div>

      {/* Top row — the Friends & Family exclusive, on its own */}
      <div className="mb-4 sm:mb-5 flex flex-col items-center">
        <p className="font-stamp text-[10px] uppercase tracking-[0.32em] text-[hsl(var(--gold-bright))] mb-2">
          ★ The Friends &amp; Family Cut ★
        </p>
        <div className="w-1/2 sm:w-1/3">
          <LineupCard strain={STRAINS[0]} onOpen={setActive} />
        </div>
      </div>

      {/* Remaining nine — three across, three rows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {STRAINS.slice(1).map((s) => (
          <LineupCard key={s.code} strain={s} onOpen={setActive} />
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-xl max-h-[88vh] overflow-y-auto grain border-[hsl(var(--gold)/0.35)] bg-[radial-gradient(ellipse_at_50%_-10%,hsl(0_18%_9%),hsl(0_0%_5%)_62%)] p-0">
          {active && (
            <div className="relative">
              {/* Case-file art header */}
              <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border">
                {activeArt ? (
                  <img src={activeArt} alt={`${active.name} label`} className="h-full w-full object-cover" draggable={false} />
                ) : (
                  <div className="flex h-full items-center justify-center font-outlaw text-2xl text-foreground">{active.name}</div>
                )}
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                <TierBadge tier={active.tier} className="absolute top-3 left-3 text-[10px]" />
              </div>

              <div className="p-5 sm:p-6">
                <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 mb-1">
                  File No. MW-{GROWER_CODE}-{active.code}
                </p>
                <DialogTitle className="font-outlaw text-2xl sm:text-3xl text-foreground leading-none">
                  {active.name}
                </DialogTitle>

                {dossier ? (
                  <>
                    {/* Type + lineage */}
                    <dl className="mt-4 grid grid-cols-1 gap-3">
                      <div className="border border-border bg-card/40 px-3 py-2">
                        <dt className="font-stamp text-[9px] uppercase tracking-[0.25em] text-tan mb-0.5">Type</dt>
                        <dd className="text-sm text-foreground">{dossier.type}</dd>
                      </div>
                      <div className="border border-border bg-card/40 px-3 py-2">
                        <dt className="font-stamp text-[9px] uppercase tracking-[0.25em] text-tan mb-0.5">Lineage</dt>
                        <dd className="text-sm text-foreground">{dossier.lineage}</dd>
                      </div>
                    </dl>

                    {/* Flavor & aroma chips */}
                    <div className="mt-4">
                      <p className="font-stamp text-[9px] uppercase tracking-[0.25em] text-tan mb-2">Flavor &amp; Aroma</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dossier.flavors.map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 text-[10px] font-stamp uppercase tracking-wider border border-tan/40 text-tan bg-tan/5 rounded-sm"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Noir blurb */}
                    <DialogDescription className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {dossier.blurb}
                    </DialogDescription>

                    {/* Leafly link — or sealed stamp for the exclusive */}
                    <div className="mt-5">
                      {dossier.leafly ? (
                        <a
                          href={dossier.leafly}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 font-stamp uppercase text-[11px] tracking-widest border border-tan/50 text-tan hover:bg-tan/10 transition-smooth focus-outlaw rounded-sm"
                        >
                          Look it up on Leafly
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 font-stamp uppercase text-[11px] tracking-widest border border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold-bright))] rounded-sm">
                          <Lock className="h-3.5 w-3.5" />
                          Sealed — No Public File
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <DialogDescription className="mt-4 text-sm text-muted-foreground">
                    Dossier sealed. Details release with the drop.
                  </DialogDescription>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
