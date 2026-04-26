import logo from "@/assets/most-wanted-logo.png";
import { Target } from "lucide-react";

export const Hero = () => (
  <section className="relative overflow-hidden grain">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(0_60%_15%/0.5),_transparent_60%)] pointer-events-none" />
    <div className="container relative pt-10 pb-16 md:pt-16 md:pb-24 text-center">
      <img src={logo} alt="Most Wanted Hemp Co." className="w-full max-w-md md:max-w-xl mx-auto mb-8 select-none" draggable={false} />

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 mb-6">
        <Target className="h-3.5 w-3.5 text-primary" />
        <span className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Concierge Drop · Live Now</span>
      </div>

      <h1 className="font-outlaw text-4xl sm:text-5xl md:text-7xl text-foreground text-shadow-outlaw mb-6 leading-[1.1]">
        Welcome to <br className="md:hidden" />
        <span className="text-primary">Most Wanted</span> Packs <span className="inline-block">🎯</span>
      </h1>

      <p className="max-w-2xl mx-auto text-muted-foreground text-base md:text-lg leading-relaxed font-stamp">
        "I started in this industry with one goal — pushing craftsmanship forward through solventless manufacturing. The path shifted, but the mission didn't. Today, I serve as a concierge to the industry's finest."
      </p>

      <div className="mt-8 inline-block">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        <p className="mt-3 font-outlaw text-xs uppercase tracking-[0.4em] text-tan">— The Outlaw —</p>
      </div>
    </div>
  </section>
);
