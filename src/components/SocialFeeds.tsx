import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";

export const SocialFeeds = () => {
  const igRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!igRef.current) return;

    const div = document.createElement("div");
    div.id = "curator-feed-default-feed-layout";
    div.innerHTML = `
      <a href="https://curator.io" target="_blank" class="crt-logo crt-tag">
        Powered by Curator.io
      </a>
    `;
    igRef.current.appendChild(div);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.charset = "UTF-8";
    script.src = "https://cdn.curator.io/published/59662559-3403-4b0b-8aca-0bb1684a0b72.js";
    document.body.appendChild(script);

    return () => {
      if (igRef.current && div.parentNode === igRef.current) {
        igRef.current.removeChild(div);
      }
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!xRef.current) return;

    const a = document.createElement("a");
    a.className = "twitter-timeline";
    a.setAttribute("data-height", "500");
    a.setAttribute("data-theme", "dark");
    a.setAttribute("data-chrome", "noheader nofooter noborders transparent");
    a.href = "https://twitter.com/mstwntdpacks";
    a.textContent = "Tweets by @mstwntdpacks";
    xRef.current.appendChild(a);

    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src = "https://platform.twitter.com/widgets.js";
    document.body.appendChild(script);

    return () => {
      if (xRef.current && a.parentNode === xRef.current) {
        xRef.current.removeChild(a);
      }
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <section className="container py-16 md:py-20">
      <div className="text-center mb-10">
        <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— The Feed —</p>
        <h2 className="font-outlaw text-3xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
          Follow the <span className="text-primary">Hunt</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Drops, restocks, and behind-the-scenes pulls — straight from the source.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Instagram — Curator.io */}
        <div className="border border-border bg-card/40 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-stamp text-xs uppercase tracking-wider text-muted-foreground">Instagram · @mstwntdpacks</span>
            <a href="https://instagram.com/mstwntdpacks" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div ref={igRef} className="min-h-[500px]" />
        </div>

        {/* X / Twitter — Official embed */}
        <div className="border border-border bg-card/40 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-stamp text-xs uppercase tracking-wider text-muted-foreground">X / Twitter · @mstwntdpacks</span>
            <a href="https://twitter.com/mstwntdpacks" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div ref={xRef} className="min-h-[500px]" />
        </div>
      </div>
    </section>
  );
};
