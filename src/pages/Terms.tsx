import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const UPDATED = "June 2026";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 py-4 px-6">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-stamp uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl py-10 prose-invert">
        <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan mb-1">— Legal —</p>
        <h1 className="font-outlaw text-3xl text-shadow-outlaw mb-1">Terms &amp; Policies</h1>
        <p className="text-xs text-muted-foreground mb-8">Last updated {UPDATED} · Most Wanted LLC</p>

        <Section title="Eligibility (21+)">
          You must be at least 21 years old to browse or purchase. By placing an order you confirm you
          are 21 or older and that hemp products are legal to receive at your shipping address.
        </Section>

        <Section title="Compliance">
          All products are derived from hemp and contain no more than 0.3% Delta-9 THC on a dry-weight
          basis, compliant with the 2018 Farm Bill. Products have not been evaluated by the FDA and are
          not intended to diagnose, treat, cure, or prevent any disease. We make no medical or health
          claims. Do not operate vehicles or machinery after use. Keep out of reach of children and pets.
        </Section>

        <Section title="How orders work">
          Each spin deals jars; you choose which to keep and check out. Every jar is a flat $89. Orders
          are placed as <em>pending payment</em> and reserved for a limited window. To complete an order,
          send the exact total via the selected method (CashApp or Chime) with your order code in the
          payment note. We confirm payment by matching that code. Orders without a matching payment, or
          left unpaid past the reservation window, are cancelled and the stock is released.
        </Section>

        <Section title="Payments">
          Payment is handled manually via CashApp or Chime at this time. We never ask for card numbers on
          this site. An order is not confirmed until payment is received and matched to your order code.
        </Section>

        <Section title="Shipping" id="shipping">
          Orders ship discreetly after payment is confirmed. We ship only to addresses in U.S.
          jurisdictions where these hemp products are legal. You are responsible for knowing your local
          laws. Delivery times vary by carrier; tracking is emailed when your order ships.
        </Section>

        <Section title="All sales final">
          Because these are consumable, small-batch products, all sales are final. We do not accept
          returns. If your order arrives damaged, contact us within 48 hours of delivery.
        </Section>

        <Section title="Contact">
          Questions about an order? Email{" "}
          <a href="mailto:mstwntdpacks@gmail.com" className="text-tan hover:text-foreground">mstwntdpacks@gmail.com</a>{" "}
          or reach us on Instagram <span className="text-tan">@mstwntdpacks</span>.
        </Section>
      </main>
    </div>
  );
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-7">
      <h2 className="font-stamp text-sm uppercase tracking-[0.2em] text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </section>
  );
}
