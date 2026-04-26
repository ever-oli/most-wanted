import { Instagram, Twitter } from "lucide-react";

export const SoldOutOverlay = () => (
  <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6 animate-reveal">
    <div className="text-center max-w-xl">
      <p className="font-stamp text-xs uppercase tracking-[0.4em] text-primary mb-4 animate-flicker">— Drop Closed —</p>
      <h2 className="font-outlaw text-5xl md:text-7xl text-foreground text-shadow-outlaw mb-4 leading-none">
        The Vault Is <span className="text-primary">Closed.</span>
      </h2>
      <p className="font-outlaw text-2xl md:text-3xl text-muted-foreground mb-8">Drop Sold Out.</p>

      <p className="text-foreground font-stamp uppercase text-sm tracking-widest mb-6">
        Missed Out? Check our socials and vote on the next drop.
      </p>

      <div className="flex justify-center gap-3">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-xs tracking-widest shadow-[var(--shadow-outlaw)] transition-smooth"
        >
          <Instagram className="h-4 w-4" /> Instagram
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 border border-foreground hover:bg-foreground hover:text-background text-foreground font-stamp uppercase text-xs tracking-widest transition-smooth"
        >
          <Twitter className="h-4 w-4" /> Twitter
        </a>
      </div>
    </div>
  </div>
);
