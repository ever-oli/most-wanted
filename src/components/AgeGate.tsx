import { useEffect, useRef, useState } from "react";
import logo from "@/assets/most-wanted-logo.png";
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
      className={`fixed inset-0 z-[100] bg-background/98 backdrop-blur-md flex items-center justify-center p-6 animate-reveal ${
        fading ? "animate-fade-out motion-reduce:animate-none" : ""
      }`}
    >
      <div className="relative max-w-lg w-full text-center">
        <div className="absolute -inset-8 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-2xl pointer-events-none" />
        <div className="relative">
          <img src={logo} alt="Most Wanted Hemp Co." className="w-full max-w-sm mx-auto mb-8 select-none" draggable={false} />
          <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— Age Verification —</p>
          <h2 className="font-outlaw text-3xl md:text-4xl text-foreground text-shadow-outlaw mb-4">
            Are You 21 or Older?
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
            By entering, you confirm you are of legal age in your jurisdiction. All products are 2018 Farm Bill compliant.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={confirm}
              className="font-stamp uppercase tracking-widest bg-primary hover:bg-primary-glow text-primary-foreground border border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
              size="lg"
            >
              I'm 21 — Enter
            </Button>
            <Button
              onClick={() => (window.location.href = "https://google.com")}
              variant="outline"
              size="lg"
              className="font-stamp uppercase tracking-widest border-border text-muted-foreground hover:bg-muted"
            >
              Exit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
