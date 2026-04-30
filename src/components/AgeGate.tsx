import { useEffect, useRef, useState } from "react";
import logo from "@/assets/most-wanted-logo.png";
import bg from "@/assets/age-gate-bg.jpg";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mwp-age-verified";

export const AgeGate = () => {
  const [open, setOpen] = useState(false);
  const [fading, setFading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, []);

  if (!open) return null;

  const confirm = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setFading(true);
    setTimeout(() => setOpen(false), 500);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-6 animate-reveal ${
        fading ? "animate-fade-out motion-reduce:animate-none" : ""
      }`}
    >
      {/* Cinematic background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_hsl(0_0%_0%/0.85)_85%)]"
      />
      {/* Grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Pinned poster card */}
      <div className="relative max-w-lg w-full -rotate-1 motion-reduce:rotate-0">
        {/* Pin */}
        <div
          aria-hidden
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_2px_4px_hsl(0_0%_0%/0.6),inset_0_-1px_2px_hsl(0_0%_0%/0.4)] z-10"
        />
        <div className="relative bg-background/95 backdrop-blur-sm border border-tan/30 shadow-[0_30px_80px_-20px_hsl(0_0%_0%/0.9),0_0_60px_hsl(var(--primary)/0.15)] px-8 py-10 text-center">
          {/* Inner double border (poster vibe) */}
          <div className="absolute inset-2 border border-tan/15 pointer-events-none" />

          <img
            src={logo}
            alt="Most Wanted Hemp Co."
            className="w-full max-w-[260px] mx-auto mb-6 select-none"
            draggable={false}
          />
          <p className="font-stamp text-[10px] uppercase tracking-[0.4em] text-tan mb-3">
            ★ By Order Of The Outlaw ★
          </p>
          <h2 className="font-outlaw text-3xl md:text-4xl text-foreground text-shadow-outlaw mb-4">
            Are You 21 or Older?
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
            By entering, you confirm you are of legal age in your jurisdiction.
            All products are 2018 Farm Bill compliant.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={confirm}
              className="font-stamp uppercase tracking-widest bg-primary hover:bg-primary-glow text-primary-foreground border border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
              size="lg"
            >
              Ride In
            </Button>
            <Button
              onClick={() => (window.location.href = "https://google.com")}
              variant="outline"
              size="lg"
              className="font-stamp uppercase tracking-widest border-border text-muted-foreground hover:bg-muted"
            >
              Turn Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
