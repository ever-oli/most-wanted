import { useParams } from "react-router-dom";
import { DROP_STORY, OPERATORS, DROP_SLUG } from "@/lib/drop-config";
import { MapPin, BadgeCheck } from "lucide-react";

export const DropStory = () => {
  const { dropId } = useParams<{ dropId: string }>();

  // Simple guard - in production you'd validate dropId against a registry
  if (dropId !== DROP_SLUG) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— Sealed —</p>
          <h1 className="font-outlaw text-2xl text-foreground">This story is not yet available.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-xl py-16 md:py-24">
        {/* Sealed letter aesthetic */}
        <div className="relative border border-border bg-card/40 p-8 md:p-12 shadow-[var(--shadow-deep)]">
          {/* Wax seal visual */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary border-4 border-background flex items-center justify-center">
            <BadgeCheck className="h-5 w-5 text-primary-foreground" />
          </div>

          <div className="text-center mb-10 mt-4">
            <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-2">
              — Confidential —
            </p>
            <h1 className="font-outlaw text-3xl md:text-4xl text-foreground text-shadow-outlaw">
              {DROP_STORY.title}
            </h1>
          </div>

          <div className="space-y-6 font-stamp text-sm leading-relaxed text-muted-foreground">
            {DROP_STORY.body.split("\n\n").map((para, i) => (
              <p key={i} className="text-foreground/90">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-border/60">
            <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-4">
              — The Operators —
            </p>
            <div className="space-y-3">
              {OPERATORS.map((op, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-stamp">
                    {op.alias} · {op.region}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 text-center">
            <p className="font-stamp text-[10px] uppercase tracking-widest text-muted-foreground/60">
              {DROP_STORY.notes}
            </p>
            <p className="mt-4 font-outlaw text-xs text-tan tracking-[0.3em]">
              — Most Wanted —
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
