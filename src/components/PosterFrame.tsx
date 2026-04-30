import { ReactNode } from "react";

/**
 * Wraps content with old-west wanted-poster style decorations:
 * - "REWARD" stamp top-left
 * - Faux paper-fold corners
 * - Subtle parchment tint on the border
 */
export const PosterFrame = ({ children }: { children: ReactNode }) => (
  <div className="relative">
    {/* REWARD stamp */}
    <div
      aria-hidden
      className="absolute -top-3 -left-3 z-10 -rotate-12 select-none pointer-events-none"
    >
      <div className="px-2.5 py-1 border-2 border-primary/70 bg-background/80 backdrop-blur-sm font-outlaw text-[11px] tracking-[0.2em] text-primary uppercase shadow-[0_0_12px_hsl(var(--primary)/0.3)]">
        Reward
      </div>
    </div>

    {/* Corner folds */}
    <div aria-hidden className="absolute top-0 right-0 w-6 h-6 z-10 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-bl from-tan/20 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-tan/30 border-r-transparent" />
    </div>
    <div aria-hidden className="absolute bottom-0 left-0 w-6 h-6 z-10 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-tan/20 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[12px] border-l-[12px] border-b-tan/30 border-l-transparent" />
    </div>

    {children}
  </div>
);
