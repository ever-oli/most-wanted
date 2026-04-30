import { Truck } from "lucide-react";

export const PromoBanner = () => (
  <div className="sticky top-0 z-40 bg-primary text-primary-foreground border-b border-primary-glow/40 relative">
    <div className="container flex items-center justify-center gap-2 py-2 text-[11px] sm:text-xs font-stamp uppercase tracking-[0.2em] animate-flicker motion-reduce:animate-none">
      <Truck className="h-3.5 w-3.5" />
      Free Shipping on 2 or More Packs
    </div>
    {/* Pulsing tan underline (subtle "live promo" cue) */}
    <div
      aria-hidden
      className="absolute left-0 right-0 -bottom-px h-px bg-tan/70 animate-pulse-underline motion-reduce:animate-none"
    />
  </div>
);
