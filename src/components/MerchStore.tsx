import { ShoppingBag, ExternalLink } from "lucide-react";

const MERCH_URL = "https://mostwantedpacks.printify.me/";

export const MerchStore = () => (
  <section id="merch" className="container py-16 md:py-20 scroll-mt-24">
    <div className="text-center mb-10 md:mb-12">
      <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— The Merch —</p>
      <h2 className="font-outlaw text-3xl sm:text-4xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
        Wear The <span className="text-primary">Brand</span>
      </h2>
      <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
        Rep the outfit on the street. Apparel and goods, stamped with the mark —
        separate from the jar drop, shipped by our print partner with its own checkout.
      </p>
    </div>

    <div className="mx-auto max-w-md">
      <div className="grain relative flex flex-col items-center gap-5 rounded-lg border border-tan/40 bg-card/40 px-6 py-10 text-center shadow-outlaw">
        <ShoppingBag className="h-9 w-9 text-primary" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          The general store's open. Pull the outfit's colors and carry the name.
        </p>
        <a
          href={MERCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-xs sm:text-sm tracking-widest transition-smooth focus-outlaw shadow-outlaw rounded-sm"
        >
          Enter The Store
          <ExternalLink className="h-4 w-4" />
        </a>
        <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
          Opens in a new tab · Shipped by our print partner
        </p>
      </div>
    </div>
  </section>
);
