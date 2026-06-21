import { useEffect, useMemo, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { X, Copy, Check, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYMENT, WILDCARD_PRICE, strainAlias, TIERS, type Tier } from "@/lib/drop-config";

export interface CheckoutItem {
  code: string;
  name: string;
  tier: Tier;
}

type Placed = {
  order_code: string;
  total: number;
  jar_count: number;
  payment_method: string;
  expires_at: number;
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

function fmt(secs: number) {
  const s = Math.max(0, secs);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function CheckoutSheet({
  items,
  onClose,
  onPlaced,
}: {
  items: CheckoutItem[];
  onClose: () => void;
  onPlaced?: () => void;
}) {
  const createOrder = useAction(api.orders.create);
  const total = items.length * WILDCARD_PRICE;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [zip, setZip] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"cashapp" | "chime">("cashapp");
  const [age, setAge] = useState(false);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!placed) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [placed]);

  const handle = method === "cashapp" ? PAYMENT.cashappTag : PAYMENT.chimeHandle;

  const submit = async () => {
    if (submitting) return;
    if (!name.trim()) return toast.error("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return toast.error("Enter a valid email.");
    if (!(address.trim() && city.trim() && stateCode && zip.trim())) return toast.error("Complete your shipping address.");
    if (!age) return toast.error("You must confirm you are 21+.");
    if (!agree) return toast.error("You must agree to the terms.");

    setSubmitting(true);
    setErr("");
    try {
      const res = await createOrder({
        customer: { name: name.trim(), email: email.trim(), phone: phone.trim() },
        shipping: { address: address.trim(), address2: address2.trim(), city: city.trim(), state: stateCode, zip: zip.trim() },
        items: items.map((i) => ({ code: i.code, name: i.name, alias: strainAlias(i.code), tier: i.tier })),
        payment_method: method,
        note: note.trim(),
        age_confirmed: age,
        agree_terms: agree,
      });
      setPlaced(res as Placed);
      onPlaced?.();
    } catch (e: any) {
      const msg = e?.data ?? e?.message ?? "Could not place order. Try again.";
      setErr(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    if (!placed) return;
    try {
      await navigator.clipboard.writeText(placed.order_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const secondsLeft = placed ? Math.round((placed.expires_at - now) / 1000) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg my-6 rounded-2xl p-[2px] bg-gold-plate shadow-[var(--shadow-gold),var(--shadow-deep)]">
        <div className="relative grain rounded-[15px] bg-[radial-gradient(ellipse_at_50%_-10%,hsl(0_32%_12%),hsl(0_0%_6%)_62%)] p-5 sm:p-7">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground focus-outlaw"
          >
            <X className="h-5 w-5" />
          </button>

          {placed ? (
            // ===== Pay-by-memo instructions =====
            <div className="text-center">
              <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan mb-1">— Order Placed · Pending Payment —</p>
              <h2 className="font-outlaw text-2xl text-primary text-shadow-outlaw mb-4">Send It To Lock It In</h2>

              <div className="border border-primary/50 bg-card/70 rounded-lg p-4 mb-4">
                <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                  Send ${placed.total} via {placed.payment_method === "chime" ? "Chime" : "CashApp"} to
                </p>
                <p className="font-outlaw text-xl text-foreground mb-3 select-all">{handle}</p>
                <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                  Put this code in the payment note
                </p>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-2 font-stamp text-2xl tracking-[0.2em] text-[hsl(var(--gold-bright))] bg-background/60 border border-[hsl(var(--gold)/0.5)] rounded px-3 py-1.5 focus-outlaw"
                >
                  {placed.order_code}
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-stamp uppercase tracking-widest text-muted-foreground mb-4">
                <Clock className="h-3.5 w-3.5" />
                {secondsLeft > 0 ? <>Reserved · {fmt(secondsLeft)} left to send</> : <>Reservation expired — contact us if you still want it</>}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                We confirm payment by the code in your note, then your order ships. No code = we can't match your payment.
                Questions? Reach out on Instagram <span className="text-tan">@mstwntdpacks</span>.
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-md bg-gold-plate text-background font-stamp uppercase text-xs tracking-widest hover:brightness-110 transition-smooth focus-outlaw shadow-[var(--shadow-gold)]"
              >
                Done
              </button>
            </div>
          ) : (
            // ===== Checkout form =====
            <>
              <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan mb-1">— Lock In Your Haul —</p>
              <h2 className="font-outlaw text-2xl text-foreground text-shadow-outlaw mb-3">Checkout</h2>

              {/* Order summary */}
              <div className="border border-border bg-card/50 rounded-lg p-3 mb-4 space-y-1">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-stamp uppercase tracking-wider">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={cn("h-2 w-2 shrink-0", TIERS[it.tier].colorClass)} />
                      <span className="truncate">{it.name}</span>
                    </span>
                    <span className="text-muted-foreground shrink-0">${WILDCARD_PRICE}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-border font-outlaw text-base">
                  <span>{items.length} Jar{items.length > 1 ? "s" : ""}</span>
                  <span className="text-primary">${total}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Field label="Full name" value={name} onChange={setName} placeholder="Jane Hunter" />
                <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" type="email" />
                <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="(555) 555-5555" type="tel" />
                <Field label="Address" value={address} onChange={setAddress} placeholder="123 Main St" />
                <Field label="Apt / Suite (optional)" value={address2} onChange={setAddress2} placeholder="Unit 4" />
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="City" value={city} onChange={setCity} placeholder="Houston" />
                  <div>
                    <label className="block font-stamp text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">State</label>
                    <select
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border text-foreground text-sm font-stamp focus:outline-none focus:border-primary/60 rounded"
                    >
                      <option value="">—</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Field label="ZIP" value={zip} onChange={setZip} placeholder="77001" />
                <Field label="Order note (optional)" value={note} onChange={setNote} placeholder="Buzz the gate" />
              </div>

              {/* Payment method */}
              <p className="font-stamp text-[10px] uppercase tracking-[0.25em] text-tan mt-5 mb-2">Payment Method</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {(["cashapp", "chime"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    aria-pressed={method === m}
                    className={cn(
                      "py-2.5 rounded-md border font-stamp uppercase text-xs tracking-widest transition-smooth focus-outlaw",
                      method === m
                        ? "border-transparent bg-gold-plate text-background shadow-[var(--shadow-gold)]"
                        : "border-[hsl(var(--gold)/0.4)] text-tan hover:border-[hsl(var(--gold)/0.7)]",
                    )}
                  >
                    {m === "cashapp" ? "CashApp" : "Chime"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                You'll get an order code on the next screen. Send the total to our {method === "cashapp" ? "CashApp" : "Chime"} with that
                code in the note — we confirm it and ship.
              </p>

              {/* Compliance */}
              <label className="flex items-start gap-2.5 cursor-pointer mb-2">
                <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
                <span className="text-xs text-muted-foreground">I confirm I am <span className="text-foreground font-semibold">21 years or older</span>.</span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer mb-3">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
                <span className="text-xs text-muted-foreground">
                  I agree to the Terms. All products are 2018 Farm Bill compliant. Not FDA evaluated; not intended to diagnose, treat, cure, or prevent any disease. All sales final.
                </span>
              </label>

              {err && (
                <div className="mb-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {err} <span className="text-muted-foreground">— close this and adjust your haul, then try again.</span>
                </div>
              )}
              <button
                onClick={submit}
                disabled={submitting}
                className="w-full py-3.5 rounded-md bg-primary text-primary-foreground font-outlaw text-lg tracking-wider hover:bg-primary-glow transition-smooth focus-outlaw shadow-[var(--shadow-outlaw)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-5 w-5" />
                {submitting ? "Placing Order…" : `Place Order · $${total}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block font-stamp text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-muted border border-border text-foreground text-sm font-stamp placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 rounded"
      />
    </div>
  );
}
