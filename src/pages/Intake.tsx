import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ArrowLeft, RefreshCw, Lock, LogOut, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const PASS_KEY = "mwp-intake-pass";

interface Order {
  _id: string;
  _creationTime: number;
  orderCode: string;
  status: string;
  customerName: string;
  email: string;
  phone: string | null;
  shippingAddress: { address: string; address2?: string; city: string; state: string; zip: string };
  items: { code: string; name: string; alias: string; tier: string; price: number }[];
  jarCount: number;
  total: number;
  paymentMethod?: string;
  customerNote?: string | null;
  trackingNumber?: string | null;
  expiresAt?: number;
  paidAt?: number;
  shippedAt?: number;
}

const STATUSES = ["all", "pending_payment", "paid", "shipped", "cancelled", "expired"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  cancelled: "Cancelled",
  expired: "Expired",
};
const STATUS_STYLE: Record<string, string> = {
  pending_payment: "border-tan/60 text-tan",
  paid: "border-primary/60 text-primary",
  shipped: "border-green-500/60 text-green-400",
  cancelled: "border-border text-muted-foreground",
  expired: "border-destructive/50 text-destructive",
};

export default function Intake() {
  const adminList = useMutation(api.orders.adminList);
  const adminUpdate = useMutation(api.orders.adminUpdate);

  const [pass, setPass] = useState("");
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (passphrase: string, status: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await adminList({ passphrase, status: status === "all" ? undefined : status });
        setOrders((res?.orders ?? []) as Order[]);
        setAuthed(true);
        sessionStorage.setItem(PASS_KEY, passphrase);
      } catch (e: any) {
        setError(e?.data ?? e?.message ?? "Could not load orders.");
        if ((e?.data ?? "").toString().toLowerCase().includes("passphrase")) {
          setAuthed(false);
          sessionStorage.removeItem(PASS_KEY);
        }
      } finally {
        setLoading(false);
      }
    },
    [adminList],
  );

  useEffect(() => {
    const saved = sessionStorage.getItem(PASS_KEY);
    if (saved) {
      setPass(saved);
      load(saved, "all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (id: string, to: string, tracking?: string) => {
    const passphrase = sessionStorage.getItem(PASS_KEY) || pass;
    try {
      await adminUpdate({ passphrase, id: id as any, to, tracking });
      await load(passphrase, filter);
    } catch (e: any) {
      setError(e?.data ?? e?.message ?? "Update failed.");
    }
  };

  const markShipped = (id: string) => {
    const tracking = window.prompt("Tracking number (optional — leave blank to skip):") ?? "";
    setStatus(id, "shipped", tracking.trim());
  };

  const logout = () => {
    sessionStorage.removeItem(PASS_KEY);
    setPass("");
    setAuthed(false);
    setOrders([]);
  };

  const visible = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      o.orderCode.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q)
    );
  });

  if (!authed) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <Lock className="h-8 w-8 text-primary mx-auto mb-4" />
          <h1 className="font-outlaw text-2xl text-shadow-outlaw mb-2">Intake</h1>
          <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-6">Operators only</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pass.trim()) load(pass.trim(), "all");
            }}
            className="space-y-3"
          >
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Passphrase"
              autoFocus
              className="w-full px-3 py-2.5 bg-muted border border-border text-foreground text-sm font-stamp text-center tracking-widest focus:outline-none focus:border-primary/60 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground font-stamp uppercase text-xs tracking-widest hover:bg-primary-glow transition-smooth rounded disabled:opacity-50"
            >
              {loading ? "Checking…" : "Enter"}
            </button>
          </form>
          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-xs font-stamp uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 py-4 px-6 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container flex items-center justify-between gap-3">
          <h1 className="font-outlaw text-xl text-shadow-outlaw">Intake</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => load(sessionStorage.getItem(PASS_KEY) || pass, filter)}
              className="inline-flex items-center gap-2 text-xs font-stamp uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 text-xs font-stamp uppercase tracking-widest text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, name, or email"
            className="w-full pl-9 pr-3 py-2 bg-muted border border-border text-foreground text-sm font-stamp placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 rounded"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-5 text-xs font-stamp uppercase tracking-widest">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                load(sessionStorage.getItem(PASS_KEY) || pass, s);
              }}
              className={cn(
                "px-3 py-1.5 border transition-colors",
                filter === s ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-destructive mb-4">{error}</p>}

        {visible.length === 0 ? (
          <p className="text-center text-muted-foreground font-stamp uppercase tracking-widest text-xs py-16">
            {loading ? "Loading…" : "No orders."}
          </p>
        ) : (
          <div className="space-y-3">
            {visible.map((o) => (
              <div key={o._id} className="border border-border bg-card/50 rounded-lg p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="font-outlaw text-lg text-[hsl(var(--gold-bright))] tracking-wider">{o.orderCode}</span>
                    <span className={cn("ml-3 px-2 py-0.5 border text-[10px] font-stamp uppercase tracking-widest", STATUS_STYLE[o.status])}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-outlaw text-xl text-primary">${o.total}</div>
                    <div className="text-[10px] font-stamp uppercase tracking-widest text-muted-foreground">
                      {o.jarCount} jar{o.jarCount > 1 ? "s" : ""} · {o.paymentMethod}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <p className="font-stamp uppercase tracking-widest text-muted-foreground mb-1">Ship to</p>
                    <p className="text-foreground">{o.customerName}</p>
                    <p className="text-muted-foreground">{o.shippingAddress.address}{o.shippingAddress.address2 ? `, ${o.shippingAddress.address2}` : ""}</p>
                    <p className="text-muted-foreground">{o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip}</p>
                    <p className="text-muted-foreground mt-1">{o.email}{o.phone ? ` · ${o.phone}` : ""}</p>
                    {o.customerNote && <p className="text-tan italic mt-1">"{o.customerNote}"</p>}
                  </div>
                  <div>
                    <p className="font-stamp uppercase tracking-widest text-muted-foreground mb-1">Pack ({o.items.length})</p>
                    <ul className="space-y-0.5">
                      {o.items.map((it, i) => (
                        <li key={i} className="text-foreground flex justify-between gap-2">
                          <span>{it.name} <span className="text-muted-foreground/60">({it.tier})</span></span>
                          <span className="text-muted-foreground/50 italic">{it.alias}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-muted-foreground/60 mt-2">
                      Placed {new Date(o._creationTime).toLocaleString()}
                    </p>
                    {o.trackingNumber && (
                      <p className="text-[10px] text-green-400 mt-0.5">Tracking: {o.trackingNumber}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                  {o.status !== "paid" && o.status !== "shipped" && (
                    <button onClick={() => setStatus(o._id, "paid")} className="px-3 py-1.5 border border-primary/60 text-primary font-stamp uppercase text-[10px] tracking-widest hover:bg-primary/10 rounded">
                      Mark Paid
                    </button>
                  )}
                  {o.status !== "shipped" && (
                    <button onClick={() => markShipped(o._id)} className="px-3 py-1.5 border border-green-500/60 text-green-400 font-stamp uppercase text-[10px] tracking-widest hover:bg-green-500/10 rounded">
                      Mark Shipped
                    </button>
                  )}
                  {o.status !== "cancelled" && (
                    <button onClick={() => setStatus(o._id, "cancelled")} className="px-3 py-1.5 border border-border text-muted-foreground font-stamp uppercase text-[10px] tracking-widest hover:bg-muted rounded">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
