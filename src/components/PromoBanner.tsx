import { Truck } from "lucide-react";

export const PromoBanner = () => (
  <div className="sticky top-0 z-40 bg-primary text-primary-foreground border-b border-primary-glow/40">
    <div className="container flex items-center justify-center gap-2 py-2 text-[11px] sm:text-xs font-stamp uppercase tracking-[0.2em] animate-flicker">
      <Truck className="h-3.5 w-3.5" />
      Free Shipping on 2 or More Packs
    </div>
  </div>
);
