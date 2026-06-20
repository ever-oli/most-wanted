import { Coins, Sparkles, Package, Star } from "lucide-react";
import { WILDCARD_PRICE, JARS_PER_PULL, SPINS_PER_RUN } from "@/lib/drop-config";

const steps = [
  { icon: Coins, title: "Pull The Lever", body: `Every pull spins ${JARS_PER_PULL} sealed 7g jars — the gamble is the cut you land. You get ${SPINS_PER_RUN} spins, ${JARS_PER_PULL * SPINS_PER_RUN} jars dealt in all.` },
  { icon: Sparkles, title: "Keep Your Cuts", body: `AAA, EXO, or the rare F&F (Friends & Family) exclusive — cuts worth $70 to $110. After your spins, keep only the jars you want and pay one flat $${WILDCARD_PRICE} each. Land the F&F and the jackpot lights up.` },
  { icon: Package, title: "Rip the Pack", body: "Discreet, odor-sealed, no branding. Tracking pings your phone the second it ships. Every jar arrives with a unique review code." },
  { icon: Star, title: "Rate It", body: "Your jar ships with a Rap Sheet — scan its code to log your verdict on the 5-point Ganjier scale. Every rating joins the public Archive for the next hunter to read." },
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
