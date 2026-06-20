import { Coins, Sparkles, Package, Star } from "lucide-react";
import { WILDCARD_PRICE, MAX_PER_PULL, PULL_CART_MAX } from "@/lib/drop-config";

const steps = [
  { icon: Coins, title: "Pull The Lever", body: `One flat price ($${WILDCARD_PRICE}) a pull — every pull wins a sealed 7g jar. The gamble is the cut you land. Up to ${MAX_PER_PULL} jars a pull, ${PULL_CART_MAX} a run.` },
  { icon: Sparkles, title: "Land Your Cut", body: "AAA, EXO, or the rare F&F exclusive. Hit the F&F and the jackpot lights up. Jars hold in your cart for 3 minutes — lock them in before the timer runs out." },
  { icon: Package, title: "Rip the Pack", body: "Discreet, odor-sealed, no branding. Tracking pings your phone the second it ships. Every jar arrives with a unique review code." },
  { icon: Star, title: "Rate & Reward", body: "Your jar ships with a numbered Rap Sheet — scan its code to log your verdict on the 5-point Ganjier scale. Joins the public Archive, earns 10% off the next drop + 24h early access." },
];

export const HowItWorks = () => (
  <section id="how" className="container py-16 md:py-20 scroll-mt-24">
    <div className="text-center mb-12">
      <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— The Mechanics —</p>
      <h2 className="font-outlaw text-3xl sm:text-4xl md:text-5xl text-foreground text-shadow-outlaw">How The Drop Works</h2>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {steps.map((s, i) => (
        <div key={s.title} className="relative group p-6 border border-border bg-card/40 hover:border-primary/60 transition-smooth">
          <span className="absolute top-3 right-3 font-outlaw text-3xl text-primary/30 group-hover:text-primary/60 transition-smooth">
            0{i + 1}
          </span>
          <s.icon className="h-7 w-7 text-primary mb-4" />
          <h3 className="font-outlaw text-xl text-foreground mb-2">{s.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  </section>
);
