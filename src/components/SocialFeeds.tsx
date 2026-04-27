import { useEffect, useRef } from "react";

export const SocialFeeds = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const div = document.createElement("div");
    div.id = "curator-feed-default-feed-layout";
    div.innerHTML = `
      <a href="https://curator.io " target="_blank" class="crt-logo crt-tag">
        Powered by Curator.io
      </a>
    `;
    containerRef.current.appendChild(div);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `
      (function(){
        var i,e,d=document,s="script";
        i=d.createElement("script");
        i.async=1;
        i.charset="UTF-8";
        i.src="https://cdn.curator.io/published/59662559-3403-4b0b-8aca-0bb1684a0b72.js ";
        e=d.getElementsByTagName(s)[0];
        e.parentNode.insertBefore(i, e);
      })();
    `;
    document.body.appendChild(script);

    return () => {
      if (containerRef.current && div.parentNode === containerRef.current) {
        containerRef.current.removeChild(div);
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <section id="feed" className="container py-16 md:py-20 scroll-mt-24">
      <div className="text-center mb-10">
        <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— The Feed —</p>
        <h2 className="font-outlaw text-3xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
          Follow the <span className="text-primary">Hunt</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Drops, restocks, and behind-the-scenes pulls — straight from the source.
        </p>
      </div>

      <div
        ref={containerRef}
        className="max-w-4xl mx-auto border border-border bg-card/40 p-4 md:p-5 min-h-[500px]"
      />
    </section>
  );
};
