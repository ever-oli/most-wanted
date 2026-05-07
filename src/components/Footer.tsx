import { Instagram, Twitter, Mail } from "lucide-react";
import { useState } from "react";

export const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="relative border-t border-border bg-muted/20">
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Column 1: Quick links */}
          <div>
            <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-4">— Navigate —</p>
            <ul className="space-y-2 text-sm font-stamp uppercase tracking-wider">
              <li><a href="#ethos" className="text-muted-foreground hover:text-foreground transition-smooth focus-outlaw">Ethos</a></li>
              <li><a href="#grading" className="text-muted-foreground hover:text-foreground transition-smooth focus-outlaw">Grading</a></li>
              <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth focus-outlaw">How It Works</a></li>
              <li><a href="#vault" className="text-muted-foreground hover:text-foreground transition-smooth focus-outlaw">The Vault</a></li>
              <li><a href="#feed" className="text-muted-foreground hover:text-foreground transition-smooth focus-outlaw">The Feed</a></li>
              <li><a href="/archive" className="text-tan hover:text-foreground transition-smooth focus-outlaw">The Archive</a></li>
              <li><a href="/review" className="text-tan hover:text-foreground transition-smooth focus-outlaw">Rate Your Jar</a></li>
            </ul>
          </div>

          {/* Column 2: Newsletter */}
          <div>
            <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-4">— Get The Drop —</p>
            <p className="text-muted-foreground text-xs mb-4 font-stamp">
              Be first to know when the vault unlocks. No spam.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) {
                  localStorage.setItem("mwp-newsletter", email.trim());
                  setEmail("");
                }
              }}
              className="flex gap-2 justify-center md:justify-start"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-3 py-2 bg-background border border-border text-foreground text-xs font-stamp placeholder:text-muted-foreground focus-outlaw"
                required
              />
              <button
                type="submit"
                className="shrink-0 px-3 py-2 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-[10px] tracking-widest transition-smooth focus-outlaw"
              >
                <Mail className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Column 3: Wholesale + social */}
          <div className="text-center md:text-right">
            <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-4">— Wholesale —</p>
            <a
              href="mailto:mstwntdpacks@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 border border-primary/60 hover:bg-primary hover:text-primary-foreground text-foreground font-stamp uppercase text-xs tracking-widest transition-smooth focus-outlaw"
            >
              <Mail className="h-4 w-4" /> mstwntdpacks@gmail.com
            </a>
            <div className="flex justify-center md:justify-end gap-4 mt-6">
              <a href="https://instagram.com/mstwntdpacks" target="_blank" rel="noreferrer" aria-label="Instagram @mstwntdpacks" className="text-muted-foreground hover:text-primary transition-smooth focus-outlaw">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/mstwntdpacks" target="_blank" rel="noreferrer" aria-label="Twitter @mstwntdpacks" className="text-muted-foreground hover:text-primary transition-smooth focus-outlaw">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal + origin */}
        <div className="mt-10 pt-8 border-t border-border/60 text-[10px] text-muted-foreground font-stamp uppercase tracking-wider flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <a href="#" className="hover:text-foreground transition-smooth focus-outlaw">Terms</a>
            <a href="#" className="hover:text-foreground transition-smooth focus-outlaw">Privacy</a>
            <a href="#" className="hover:text-foreground transition-smooth focus-outlaw">Shipping Policy</a>
            <a href="#" className="hover:text-foreground transition-smooth focus-outlaw">COA Lookup</a>
          </div>
          <p className="text-muted-foreground/50">
            Crafted in the South · Most Wanted LLC
          </p>
        </div>

        <div className="mt-4 text-center text-[10px] text-muted-foreground/40 font-stamp uppercase tracking-wider">
          <p>All products are 2018 Farm Bill compliant.</p>
          <p>Must be 21+ to purchase. Keep out of reach of children.</p>
          <p className="mt-1">© {new Date().getFullYear()} Most Wanted LLC.</p>
        </div>
      </div>
    </footer>
  );
};
