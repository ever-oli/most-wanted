import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Clock } from "lucide-react";
import { NEXT_DROP_AT } from "@/lib/drop-config";

const NOTIFY_KEY = "mwp-notify-list";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: diff === 0 };
}

const Cell = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center min-w-[56px]">
    <div className="font-outlaw text-2xl sm:text-3xl md:text-4xl text-foreground text-shadow-outlaw tabular-nums">
      {value.toString().padStart(2, "0")}
    </div>
    <div className="font-stamp text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">
      {label}
    </div>
  </div>
);

export const VaultCountdown = () => {
  const target = NEXT_DROP_AT.getTime();
  const [remaining, setRemaining] = useState(() => getRemaining(target));
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email.", { className: "font-stamp" });
      return;
    }
    try {
      const raw = localStorage.getItem(NOTIFY_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(trimmed)) list.push(trimmed);
      localStorage.setItem(NOTIFY_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setSubscribed(true);
    setEmail("");
    toast.success("You're on the list.", {
      description: "We'll holler when the vault unlocks.",
      className: "font-stamp",
    });
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
      <div className="relative z-20 w-full max-w-md text-center px-6 py-8 border border-primary/50 bg-card/95 shadow-[var(--shadow-outlaw)] rounded-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 mb-4">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="font-stamp text-[10px] uppercase tracking-[0.25em] text-tan">
            Next Drop In
          </span>
        </div>

        <h3 className="font-outlaw text-xl md:text-2xl text-foreground text-shadow-outlaw mb-5">
          The Vault Unlocks Soon
        </h3>

        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          <Cell value={remaining.days} label="Days" />
          <div className="font-outlaw text-2xl sm:text-3xl text-primary/40 self-start mt-1">:</div>
          <Cell value={remaining.hours} label="Hrs" />
          <div className="font-outlaw text-2xl sm:text-3xl text-primary/40 self-start mt-1">:</div>
          <Cell value={remaining.minutes} label="Min" />
          <div className="font-outlaw text-2xl sm:text-3xl text-primary/40 self-start mt-1">:</div>
          <Cell value={remaining.seconds} label="Sec" />
        </div>

        <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-5" />

        {subscribed ? (
          <p className="font-stamp text-xs uppercase tracking-widest text-tan flex items-center justify-center gap-2">
            <Bell className="h-3.5 w-3.5 text-primary" /> You're on the list
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <label
              htmlFor="notify-email"
              className="block font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              Get notified when it goes live
            </label>
            <div className="flex gap-2">
              <input
                id="notify-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 min-w-0 px-3 py-2 bg-muted border border-border text-foreground text-sm font-stamp placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
              />
              <button
                type="submit"
                className="shrink-0 px-3 sm:px-4 py-2 bg-primary hover:bg-primary-glow text-primary-foreground font-stamp uppercase text-[10px] sm:text-xs tracking-widest shadow-[var(--shadow-outlaw)] transition-smooth flex items-center gap-1.5"
              >
                <Bell className="h-3.5 w-3.5" />
                Notify Me
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
