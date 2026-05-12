import { Link } from "react-router-dom";
import { ArrowRight, Hash, QrCode, Stamp } from "lucide-react";
import rapSheetImg from "@/assets/rap-sheet-mock.png";
import { PosterFrame } from "@/components/PosterFrame";
import { DROP_NAME, FIRST_BATCH_CODE } from "@/lib/drop-config";

export const RapSheet = () => (
  <section id="rap-sheet" className="container py-16 md:py-24 scroll-mt-24">
    <div className="text-center mb-12 md:mb-16">
      <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">
        — The Keepsake —
      </p>
      <h2 className="font-outlaw text-3xl sm:text-4xl md:text-5xl text-foreground text-shadow-outlaw">
        Every Jar Comes With A Record
      </h2>
      <p className="mt-4 max-w-xl mx-auto text-sm md:text-base text-muted-foreground leading-relaxed">
        A folded paper rap sheet — numbered, drop-unique, and inked with the bounty's
        full criminal history. Yours to archive. Scan it to log your verdict.
      </p>
      <p className="mt-2 font-stamp text-[10px] uppercase tracking-[0.3em] text-tan">
        {DROP_NAME.toUpperCase()} · 014 / 100
      </p>
      <p className="mt-1 font-stamp text-[11px] uppercase tracking-[0.2em] text-foreground/70">
        Batch: {FIRST_BATCH_CODE}
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
      {/* Rap Sheet mock */}
      <div className="relative">
        <PosterFrame>
          <img
            src={rapSheetImg}
            alt="Rap Sheet keepsake — a numbered wanted poster for the strain inside your jar"
            loading="lazy"
            width={1024}
            height={1280}
            className="w-full h-auto border border-border bg-card"
          />
        </PosterFrame>
      </div>

      {/* Bullets + CTAs */}
      <div className="space-y-6">

        <ul className="space-y-3 text-sm md:text-base">
          <li className="flex gap-3">
            <Stamp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span>
              <span className="font-stamp uppercase tracking-widest text-xs text-foreground block mb-1">
                Numbered & Drop-Unique
              </span>
              <span className="text-muted-foreground">
                Limited print run per drop. Mugshot art changes every hunt — never reprinted.
              </span>
            </span>
          </li>
          <li className="flex gap-3">
            <Hash className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span>
              <span className="font-stamp uppercase tracking-widest text-xs text-foreground block mb-1">
                Your Batch, Your Record
              </span>
              <span className="text-muted-foreground">
                The code on your sheet matches your jar — proof of pedigree, lineage, and grower.
              </span>
            </span>
          </li>
          <li className="flex gap-3">
            <QrCode className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span>
              <span className="font-stamp uppercase tracking-widest text-xs text-foreground block mb-1">
                Rate It, Archive It
              </span>
              <span className="text-muted-foreground">
                Scan to log your verdict. Earn 10% off the next hunt + 24h early access.
              </span>
            </span>
          </li>
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/archive"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-tan/60 text-tan font-stamp uppercase text-[11px] tracking-widest hover:bg-tan/5 transition-colors"
          >
            See The Archive <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/review"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-stamp uppercase text-[11px] tracking-widest hover:bg-primary-glow transition-colors shadow-[var(--shadow-outlaw)]"
          >
            Submit A Verdict <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);
