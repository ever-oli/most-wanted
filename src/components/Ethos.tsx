import { Crosshair } from "lucide-react";

export const Ethos = () => (
  <section id="ethos" className="relative border-y border-border/60 bg-muted/20 scroll-mt-24">
    <div className="container py-16 md:py-20 max-w-3xl text-center">
      <Crosshair className="h-8 w-8 text-primary mx-auto mb-5" />
      <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-4">— The Ethos —</p>
      <h2 className="font-outlaw text-3xl sm:text-4xl md:text-5xl text-foreground mb-6 text-shadow-outlaw">
        We Don't Source. <span className="text-primary">We Hunt.</span>
      </h2>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
        We partner with the most elite legacy operators to secure small-batch, premium drops. You aren't just buying a jar; you are securing a ticket to a highly curated tasting menu that took months to secure. This isn't about volume.
        <span className="block mt-3 text-foreground font-semibold">It's about what's most wanted.</span>
      </p>
    </div>
  </section>
);
