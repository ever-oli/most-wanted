import { WANTED_LIST_CLUES, DROP_NAME } from "@/lib/drop-config";
import { Crosshair } from "lucide-react";

export const WantedList = () => (
  <section id="wanted-list" className="relative border-y border-border/60 bg-muted/20 scroll-mt-24">
    <div className="container py-12 md:py-16 max-w-2xl text-center">
      <Crosshair className="h-7 w-7 text-primary mx-auto mb-4" />
      <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— Wanted List —</p>
      <h2 className="font-outlaw text-2xl md:text-4xl text-foreground text-shadow-outlaw mb-2">
        {DROP_NAME}
      </h2>
      <p className="text-muted-foreground text-xs md:text-sm font-stamp mb-8 max-w-md mx-auto">
        Clues surface before the drop. No photos. No names. Just what you need to know.
      </p>

      <div className="space-y-4 text-left">
        {WANTED_LIST_CLUES.map((clue, i) => (
          <div key={i} className="flex items-start gap-3 border border-border bg-card/40 p-4">
            <span className="font-outlaw text-lg text-primary shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <p className="font-stamp text-sm text-foreground leading-relaxed">{clue}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
