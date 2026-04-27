import { useEffect } from "react";
import { Instagram, Twitter } from "lucide-react";

export const SocialFeeds = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
          <div className="flex items-center gap-2 mb-4">
            <Twitter className="h-4 w-4 text-primary" />
            <span className="font-stamp text-xs uppercase tracking-wider text-muted-foreground">
              @mstwntdpacks
            </span>
          </div>
          <div className="overflow-hidden rounded border border-border/60">
            <a
              className="twitter-timeline"
              data-height="500"
              data-theme="dark"
              data-chrome="noheader nofooter transparent"
              href="https://twitter.com/mstwntdpacks"
            >
              Tweets by @mstwntdpacks
            </a>
          </div>
        </div>

        {/* Instagram Profile Card */}
        <div className="border border-border bg-card/40 p-4 md:p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Instagram className="h-4 w-4 text-primary" />
            <span className="font-stamp text-xs uppercase tracking-wider text-muted-foreground">
              @mstwntdpacks
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-border/60 bg-muted/20">
            <div className="w-20 h-20 rounded-full border-2 border-primary/50 bg-muted flex items-center justify-center mb-4">
              <Instagram className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-outlaw text-xl text-foreground mb-1">@mstwntdpacks</h3>
            <p className="text-muted-foreground text-sm font-stamp mb-4">
              Concierge drops. Elite cultivars. Zero compromise.
            </p>
            <a
              href="https://instagram.com/mstwntdpacks"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-xs tracking-widest shadow-[var(--shadow-outlaw)] transition-smooth"
            >
              View Profile
            </a>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground/50 font-stamp text-center">
            Full Instagram feed embed requires a third-party widget service.
          </p>
        </div>
      </div>
    </section>
  );
};
