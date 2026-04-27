import { useEffect, useRef, useState } from "react";
import { Instagram, Twitter, ExternalLink } from "lucide-react";

// NOTE: Instagram blocks iframe embedding via X-Frame-Options.
// There is no workaround without a third-party paid service (Elfsight, Curator, etc.).

export const SocialFeeds = () => {
  const twitterRef = useRef<HTMLDivElement>(null);
  const [twitterLoaded, setTwitterLoaded] = useState(false);

  useEffect(() => {
    // Load Twitter widgets.js if not already loaded
    const existing = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      script.onload = () => setTwitterLoaded(true);
      document.head.appendChild(script);
    } else {
      setTwitterLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Explicitly tell Twitter to scan for embeds after React renders
    if (twitterLoaded && twitterRef.current && (window as any).twttr) {
      (window as any).twttr.widgets.load(twitterRef.current);
    }
  }, [twitterLoaded]);

  return (
    <section className="container py-16 md:py-20">
      <div className="text-center mb-10">
        <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— Stay in the Loop —</p>
        <h2 className="font-outlaw text-3xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
          Follow the <span className="text-primary">Hunt</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Drops, restocks, and behind-the-scenes pulls — straight from the source.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Twitter/X Timeline */}
        <div className="border border-border bg-card/40 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-primary" />
              <span className="font-stamp text-xs uppercase tracking-wider text-muted-foreground">
                @mstwntdpacks
              </span>
            </div>
            <a
              href="https://twitter.com/mstwntdpacks"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-smooth"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div ref={twitterRef} className="overflow-hidden rounded border border-border/60 min-h-[400px]">
            <a
              className="twitter-timeline"
              data-height="500"
              data-theme="dark"
              data-chrome="noheader nofooter noborders transparent"
              href="https://twitter.com/mstwntdpacks"
            >
              Tweets by @mstwntdpacks
            </a>
          </div>
        </div>

        {/* Instagram Profile Card — iframe blocked, so we build a compelling link-out */}
        <div className="border border-border bg-card/40 p-4 md:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-primary" />
              <span className="font-stamp text-xs uppercase tracking-wider text-muted-foreground">
                @mstwntdpacks
              </span>
            </div>
            <a
              href="https://instagram.com/mstwntdpacks"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-smooth"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-border/60 bg-gradient-to-b from-muted/10 to-muted/30 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full border-2 border-primary/40 bg-muted flex items-center justify-center mb-5 shadow-[var(--shadow-outlaw)]">
                <Instagram className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-outlaw text-2xl text-foreground mb-2">@mstwntdpacks</h3>
              <p className="text-muted-foreground text-sm font-stamp mb-1 max-w-[240px]">
                Concierge drops. Elite cultivars. Zero compromise.
              </p>
              <p className="text-tan text-[11px] font-stamp uppercase tracking-wider mb-5">
                Follow for drop announcements
              </p>
              <a
                href="https://instagram.com/mstwntdpacks"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-xs tracking-widest shadow-[var(--shadow-outlaw)] transition-smooth"
              >
                <Instagram className="h-3.5 w-3.5" />
                View on Instagram
              </a>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-muted-foreground/40 font-stamp text-center leading-relaxed">
            Instagram does not allow profile feed embedding.
            <br />
            Full feed requires a third-party widget service.
          </p>
        </div>
      </div>
    </section>
  );
};
