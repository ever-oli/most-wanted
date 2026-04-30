import { MessageCircle, Lock, ExternalLink } from "lucide-react";

export const HashHolesDrop = () => {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(0_60%_15%/0.3),_transparent_70%)] pointer-events-none" />
      
      <div className="container relative py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 mb-5">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span className="font-stamp text-[10px] uppercase tracking-[0.25em] text-primary">
              Featured Drop · While Supplies Last
            </span>
          </div>
          
          <h2 className="font-outlaw text-3xl sm:text-4xl md:text-5xl text-foreground mb-3">
            Tsunami x Fideley
          </h2>
          <p className="font-outlaw text-xl sm:text-2xl text-primary tracking-wide">
            HASH HOLES
          </p>
        </div>

        {/* Product + Contact Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl mx-auto">
          {/* Product Image */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
            <img
              src="/images/hash-holes-promo.png"
              alt="Tsunami x Fideley Hash Holes"
              className="relative w-full rounded-xl border border-border/80 shadow-2xl"
              draggable={false}
            />
          </div>

          {/* Contact / CTA */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <p className="font-stamp text-sm uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Order direct while the vault is being restocked
            </p>

            {/* Signal Contact Card */}
            <div className="w-full max-w-sm bg-background/80 backdrop-blur border border-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#3A76F0]/15 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-[#3A76F0]" />
                </div>
                <div>
                  <p className="font-stamp text-xs uppercase tracking-[0.2em] text-muted-foreground">Contact on Signal</p>
                  <p className="font-outlaw text-lg text-foreground">ever.07</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <img
                  src="/images/signal-qr.png"
                  alt="Signal QR Code"
                  className="w-32 h-32 rounded-lg border border-border/60"
                  draggable={false}
                />
                <div className="flex flex-col gap-2 text-left">
                  <p className="font-stamp text-[11px] text-muted-foreground leading-relaxed">
                    Scan to start a secure chat. No phone number needed.
                  </p>
                  <a
                    href="https://signal.me/#eu/ever.07"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-stamp text-xs text-[#3A76F0] hover:underline"
                  >
                    Open Signal
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <p className="mt-6 font-stamp text-[11px] uppercase tracking-[0.15em] text-tan">
              1 for $75 · 2 for $140 · Limited Drop
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
