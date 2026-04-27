import { ExternalLink } from "lucide-react";

// Curator.io — Instagram feed embed (works around Meta's iframe block)
const curatorEmbedHtml = `
  <div id="curator-feed-default-feed-layout">
    <a href="https://curator.io" target="_blank" class="crt-logo crt-tag">Powered by Curator.io</a>
  </div>
  <script type="text/javascript">
    (function(){
      var i, e, d = document, s = "script";
      i = d.createElement("script");
      i.async = 1;
      i.charset = "UTF-8";
      i.src = "https://cdn.curator.io/published/59662559-3403-4b0b-8aca-0bb1684a0b72.js";
      e = d.getElementsByTagName(s)[0];
      e.parentNode.insertBefore(i, e);
    })();
  </script>
`;

export const SocialFeeds = () => (
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

    <div className="max-w-4xl mx-auto border border-border bg-card/40 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-stamp text-xs uppercase tracking-wider text-muted-foreground">
          @mstwntdpacks
        </span>
        <a
          href="https://instagram.com/mstwntdpacks"
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-primary transition-smooth"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div
        className="overflow-hidden rounded border border-border/60 min-h-[500px]"
        dangerouslySetInnerHTML={{ __html: curatorEmbedHtml }}
      />
    </div>
  </section>
);
