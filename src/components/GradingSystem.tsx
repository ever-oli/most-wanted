import gradingSystem from "@/assets/grading-system.png";
import { Award } from "lucide-react";

export const GradingSystem = () => (
  <section className="container py-16 md:py-20">
    <div className="text-center mb-10">
      <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— Our Standard —</p>
      <h2 className="font-outlaw text-3xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
        The <span className="text-primary">5-Point</span> Grading System
      </h2>
      <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
        Every jar is judged. Every batch is held to a standard that separates the good from the truly exceptional.
      </p>
    </div>

    <div className="relative max-w-4xl mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-b from-primary/10 via-transparent to-primary/10 blur-2xl pointer-events-none" />
      <div className="relative border border-border bg-card/40 overflow-hidden">
        <img
          src={gradingSystem}
          alt="The Most Wanted 5-Point Grading System — Appearance, Aroma, Flavor, Translation, Experience"
          className="w-full h-auto block"
          loading="lazy"
        />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
    </div>

    <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/60 text-[11px] font-stamp uppercase tracking-wider">
      <Award className="h-3.5 w-3.5 text-primary" />
      Our Standard. Your Assurance.
    </div>
  </section>
);
