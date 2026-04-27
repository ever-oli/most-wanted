import { Star, Quote } from "lucide-react";

const QUOTES = [
  {
    text: "Best concierge pack I've ever received. The EXO tier was straight gas.",
    name: "Verified Buyer",
    role: "Legacy Operator",
  },
  {
    text: "Mystery drops done right. No fluff, just fire. Already locked in for the next one.",
    name: "Verified Buyer",
    role: "Repeat Hunter",
  },
  {
    text: "Premium product, discreet shipping, and the drop experience is unmatched.",
    name: "Verified Buyer",
    role: "First Drop",
  },
];

export const Testimonials = () => (
  <section className="relative border-y border-border/60 bg-muted/20 overflow-hidden">
    <div className="container py-12 md:py-16">
      <div className="text-center mb-8">
        <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— The Word —</p>
        <h2 className="font-outlaw text-2xl md:text-4xl text-foreground text-shadow-outlaw">
          Proof From <span className="text-primary">The Field</span>
        </h2>
      </div>

      {/* Mobile: stack. Desktop: horizontal marquee */}
      <div className="md:hidden grid gap-4">
        {QUOTES.map((q, i) => (
          <div key={i} className="border border-border bg-card/60 p-5 text-center">
            <Quote className="h-4 w-4 text-primary/60 mx-auto mb-3" />
            <p className="font-stamp text-sm text-foreground leading-relaxed mb-4">"{q.text}"</p>
            <div className="flex items-center justify-center gap-1 text-tan">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-3 w-3 fill-tan" />
              ))}
            </div>
            <p className="mt-3 font-stamp text-[10px] uppercase tracking-widest text-muted-foreground">
              {q.name} · {q.role}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop marquee */}
      <div className="hidden md:block relative">
        <div className="flex animate-marquee motion-reduce:animate-none">
          {/* Duplicate for seamless loop */}
          {[...QUOTES, ...QUOTES, ...QUOTES].map((q, i) => (
            <div key={i} className="shrink-0 w-[340px] mx-3 border border-border bg-card/60 p-6 text-center">
              <Quote className="h-4 w-4 text-primary/60 mx-auto mb-3" />
              <p className="font-stamp text-sm text-foreground leading-relaxed mb-4">"{q.text}"</p>
              <div className="flex items-center justify-center gap-1 text-tan">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-3 w-3 fill-tan" />
                ))}
              </div>
              <p className="mt-3 font-stamp text-[10px] uppercase tracking-widest text-muted-foreground">
                {q.name} · {q.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
