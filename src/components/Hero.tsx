import logo from "@/assets/most-wanted-logo.png";
import { Target, Lock, ChevronDown } from "lucide-react";
import { DROP_LIVE } from "@/lib/drop-config";
import { useEffect, useState } from "react";

const TAGLINES = [
  "Small-batch.",
  "Legacy operators.",
  "Sealed until your door.",
];

export const Hero = () => {
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, 3600);
    return () => clearInterval(id);
  }, []);

  // Pre-computed ember positions/timings (stable across renders)
  const embers = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 53) % 100}%`,
    delay: `${(i * 0.7) % 12}s`,
    dur: `${10 + (i % 7)}s`,
    x: `${(i % 2 ? 1 : -1) * (15 + (i * 3) % 30)}px`,
    size: i % 4 === 0 ? 3 : 2,
  }));

  return (
    <section className="relative overflow-hidden grain">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(0_60%_15%/0.5),_transparent_60%)] pointer-events-none" />
      {/* Parallax grain layer */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
      {/* Drifting embers */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        {embers.map((e, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full bg-primary/60 blur-[1px] animate-ember motion-reduce:hidden"
            style={{
              left: e.left,
              width: e.size,
              height: e.size,
              ["--ember-delay" as string]: e.delay,
              ["--ember-dur" as string]: e.dur,
              ["--ember-x" as string]: e.x,
            }}
          />
        ))}
      </div>
      <div className="container relative pt-10 pb-16 md:pt-16 md:pb-24 text-center">
        <img src={logo} alt="Most Wanted Hemp Co." className="w-full max-w-md md:max-w-xl mx-auto mb-8 select-none" draggable={false} />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 mb-6">
          {DROP_LIVE ? (
            <Target className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-tan" />
          )}
          <span className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {DROP_LIVE ? "Concierge Drop · Live Now" : "Vault Sealed · Coming Soon"}
          </span>
        </div>

        <h1 className="font-outlaw text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground text-shadow-outlaw mb-4 leading-[1.1]">
          Welcome to <br className="md:hidden" />
          <span className="text-primary">Most Wanted</span> Packs
        </h1>

        {/* Animated tagline rotator */}
        <div className="min-h-[1.75rem] md:min-h-[1.5rem] mb-4 flex items-center justify-center">
          <p
            key={taglineIndex}
            className="font-stamp text-xs uppercase tracking-[0.35em] text-tan animate-tagline-fade motion-reduce:animate-none leading-relaxed"
          >
            — {TAGLINES[taglineIndex]} —
          </p>
        </div>

        <p className="max-w-2xl mx-auto text-muted-foreground text-base md:text-lg leading-relaxed font-stamp">
          "I started in this industry with one goal — pushing craftsmanship forward through solventless manufacturing. The path shifted, but the mission didn't. Today, I serve as a concierge to the industry's finest."
        </p>

        <div className="mt-8 inline-block">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          <p className="mt-3 font-outlaw text-xs uppercase tracking-[0.4em] text-tan">— The Outlaw —</p>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-scroll-cue motion-reduce:animate-none">
        <ChevronDown className="h-5 w-5 text-muted-foreground/60" />
      </div>
    </section>
  );
};
