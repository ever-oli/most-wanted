import { Link } from "react-router-dom";
import { ArrowRight, QrCode } from "lucide-react";

/**
 * Condensed keepsake strip — every jar ships with a numbered Rap Sheet you can
 * scan to log a verdict. Kept compact; the full review flow lives at /review.
 */
export const RapSheet = () => (
  <section id="rap-sheet" className="container py-10 md:py-12 scroll-mt-24">
    <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-border bg-card/40 px-5 py-5 sm:px-7">
      <QrCode className="h-9 w-9 text-primary shrink-0" />
      <div className="text-center sm:text-left flex-1">
        <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan mb-1">— The Keepsake —</p>
        <h2 className="font-outlaw text-xl sm:text-2xl text-foreground text-shadow-outlaw">
          Every Jar Ships With A Rap Sheet
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          A numbered, drop-unique keepsake. Scan its code to log your verdict — earns 10% off the next hunt + 24h early access.
        </p>
      </div>
      <Link
        to="/review"
        className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-stamp uppercase text-[11px] tracking-widest hover:bg-primary-glow transition-colors shadow-[var(--shadow-outlaw)]"
      >
        Submit A Verdict <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  </section>
);
