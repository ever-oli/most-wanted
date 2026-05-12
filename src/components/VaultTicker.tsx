import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RECRUITMENT_GOAL, GRID_SIZE } from "@/lib/drop-config";

/**
 * Live activity ticker above the sealed vault.
 *  - watched: real signups count from the wanted-list-signup edge function
 *  - hunters online: tasteful synthetic counter (no fake sales)
 *  - latest: a synthetic "square N just got eyed" line that ticks on a timer
 */
export const VaultTicker = () => {
  const [watched, setWatched] = useState(0);
  const [online, setOnline] = useState(() => 18 + Math.floor(Math.random() * 12));
  const [latestSquare, setLatestSquare] = useState(() =>
    Math.floor(Math.random() * GRID_SIZE * GRID_SIZE) + 1
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("wanted-list-signup", {
          method: "GET",
        });
        if (!cancelled && data && typeof data.count === "number") {
          setWatched(data.count);
        }
      } catch {
        /* keep 0 */
      }
    })();

    // Drift "online" count slowly in a believable range
    const onlineTimer = setInterval(() => {
      setOnline((n) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = n + delta;
        if (next < 12) return 12;
        if (next > 38) return 38;
        return next;
      });
    }, 7000);

    // Tick a new "eyed" square periodically
    const eyedTimer = setInterval(() => {
      setLatestSquare(Math.floor(Math.random() * GRID_SIZE * GRID_SIZE) + 1);
    }, 5500);

    return () => {
      cancelled = true;
      clearInterval(onlineTimer);
      clearInterval(eyedTimer);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-2xl mx-auto mb-3 px-3 py-1.5 border border-border/60 bg-card/40 font-stamp text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between gap-3 overflow-hidden"
    >
      <span className="flex items-center gap-2 truncate">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse motion-reduce:animate-none shrink-0" />
        <span className="truncate">
          square <span className="text-tan">#{latestSquare}</span> just got eyed
        </span>
      </span>
      <span className="hidden sm:inline shrink-0">
        <span className="text-tan tabular-nums">{watched}</span> / {RECRUITMENT_GOAL} watched
      </span>
      <span className="shrink-0">
        <span className="text-tan tabular-nums">{online}</span> live
      </span>
    </div>
  );
};
