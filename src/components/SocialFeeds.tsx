import { Instagram, Twitter, ExternalLink } from "lucide-react";

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

    <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
      <a
        href="https://instagram.com/mstwntdpacks"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 px-6 py-4 border border-border bg-card/40 hover:border-primary/60 hover:bg-primary/10 transition-smooth"
      >
        <Instagram className="h-5 w-5 text-primary" />
        <div className="text-left">
          <span className="block font-outlaw text-sm text-foreground">Instagram</span>
          <span className="block font-stamp text-[10px] uppercase tracking-wider text-muted-foreground">@mstwntdpacks</span>
        </div>
        <ExternalLink className="h-3 w-3 text-muted-foreground ml-2" />
      </a>

      <a
        href="https://twitter.com/mstwntdpacks"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 px-6 py-4 border border-border bg-card/40 hover:border-primary/60 hover:bg-primary/10 transition-smooth"
      >
        <Twitter className="h-5 w-5 text-primary" />
        <div className="text-left">
          <span className="block font-outlaw text-sm text-foreground">X / Twitter</span>
          <span className="block font-stamp text-[10px] uppercase tracking-wider text-muted-foreground">@mstwntdpacks</span>
        </div>
        <ExternalLink className="h-3 w-3 text-muted-foreground ml-2" />
      </a>
    </div>
  </section>
);
