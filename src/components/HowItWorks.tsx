import { Layers, MousePointerClick, Package, Star } from "lucide-react";

const steps = [
  { icon: Layers, title: "Choose Your Tier", body: "EXO ($110) or AAA ($75). Each tier unlocks a different pedigree of cultivar in a sealed 7g jar. Max 2 per tier, 3 per order — no whales." },
  { icon: MousePointerClick, title: "Secure Your Square", body: "Lock in your spot on the grid. Once it's gone, it's gone." },
  { icon: Package, title: "Rip the Pack", body: "1 of 3 mystery variants per tier. Your jar arrives sealed with a unique review token printed on the card." },
  { icon: Star, title: "Rate & Reward", body: "Drop your verdict on the 5-point Ganjier scale. Your review joins the public Archive — and earns you 10% off the next drop plus 24h early access." },
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
