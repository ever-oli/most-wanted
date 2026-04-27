import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "ethos", label: "Ethos" },
  { id: "grading", label: "Grading" },
  { id: "how", label: "How It Works" },
  { id: "faq", label: "FAQ" },
  { id: "vault", label: "The Vault" },
  { id: "feed", label: "Feed" },
];

export const AnchorNav = () => {
  const [active, setActive] = useState<string>("ethos");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-[32px] z-30 border-b border-border/60 bg-background/85 backdrop-blur-md"
    >
      <div className="container">
        <ul className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-outlaw py-2">
          {LINKS.map((l) => (
            <li key={l.id} className="shrink-0">
              <a
                href={`#${l.id}`}
                onClick={(e) => handleClick(e, l.id)}
                className={cn(
                  "px-3 py-1.5 font-stamp uppercase text-[11px] tracking-[0.2em] transition-smooth border border-transparent",
                  active === l.id
                    ? "text-primary border-primary/50 bg-primary/5"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
