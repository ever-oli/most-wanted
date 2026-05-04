const ITEMS = [
  "Small-Batch Drops",
  "Sealed Until Your Door",
  "64 Squares · 64 Outlaws",
  "Concierge to the Finest",
  "Solventless Heritage",
];

export const MarqueeStrip = () => (
  <div
    aria-hidden
    className="hidden sm:block border-b border-border/60 bg-card/40 overflow-hidden motion-reduce:hidden"
  >
    <div className="flex whitespace-nowrap animate-marquee will-change-transform">
      {[0, 1].map((dup) => (
        <div key={dup} className="flex shrink-0">
          {ITEMS.map((it, i) => (
            <span
              key={`${dup}-${i}`}
              className="flex items-center gap-3 px-6 py-1.5 font-stamp uppercase text-[10px] tracking-[0.3em] text-tan/70"
            >
              <span className="text-primary/70">★</span>
              {it}
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);
