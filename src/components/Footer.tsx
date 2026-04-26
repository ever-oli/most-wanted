import { Instagram, Twitter, Mail } from "lucide-react";

export const Footer = () => (
  <footer className="relative border-t border-border bg-muted/20 mt-12">
    <div className="container py-12 text-center">
      <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— Wholesale Inquiries —</p>
      <h3 className="font-outlaw text-2xl md:text-3xl text-foreground mb-4">
        Reach Out for <span className="text-primary">Wholesale Services</span>
      </h3>
      <a
        href="mailto:mstwntdpacks@gmail.com"
        className="inline-flex items-center gap-2 px-5 py-3 border border-primary/60 hover:bg-primary hover:text-primary-foreground text-foreground font-stamp uppercase text-xs tracking-widest transition-smooth"
      >
        <Mail className="h-4 w-4" /> mstwntdpacks@gmail.com
      </a>

      <div className="flex justify-center gap-4 mt-8">
        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-smooth">
          <Instagram className="h-5 w-5" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-smooth">
          <Twitter className="h-5 w-5" />
        </a>
      </div>

      <div className="mt-10 pt-6 border-t border-border/60 text-[11px] text-muted-foreground font-stamp uppercase tracking-wider space-y-2">
        <p>All products are 2018 Farm Bill compliant.</p>
        <p>Must be 21+ to purchase. Keep out of reach of children.</p>
        <p className="text-muted-foreground/60">© {new Date().getFullYear()} Most Wanted Hemp Co.</p>
      </div>
    </div>
  </footer>
);
