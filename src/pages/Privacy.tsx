import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const UPDATED = "June 2026";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 py-4 px-6">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-stamp uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl py-10">
        <p className="font-stamp text-[10px] uppercase tracking-[0.3em] text-tan mb-1">— Legal —</p>
        <h1 className="font-outlaw text-3xl text-shadow-outlaw mb-1">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mb-8">Last updated {UPDATED} · Most Wanted LLC</p>

        <Section title="What we collect">
          To fulfill an order we collect your name, email, phone (optional), and shipping address, plus
          the items and payment method you selected. We do not collect or store card numbers — payment is
          handled manually through CashApp or Chime.
        </Section>

        <Section title="How we use it">
          We use your information solely to process, confirm, and ship your order, to send order-related
          email (confirmation and shipping updates), and to respond to support requests. If you join the
          wanted list, we use your email only to notify you about upcoming drops.
        </Section>

        <Section title="What we don't do">
          We don't sell your data. We don't share it except with the service providers strictly needed to
          run the store (e.g., our backend host and email provider) and shipping carriers.
        </Section>

        <Section title="Reviews">
          If you submit a review, the verdict and any display name you choose become part of the public
          Archive. Don't include personal information in review notes you don't want public.
        </Section>

        <Section title="Retention &amp; your choices">
          We keep order records as long as needed for fulfillment, support, and legal/accounting purposes.
          To access, correct, or delete your information, or to unsubscribe from the wanted list, email us
          and we'll take care of it.
        </Section>

        <Section title="Contact">
          Email{" "}
          <a href="mailto:mstwntdpacks@gmail.com" className="text-tan hover:text-foreground">mstwntdpacks@gmail.com</a>{" "}
          or reach us on Instagram <span className="text-tan">@mstwntdpacks</span>.
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="font-stamp text-sm uppercase tracking-[0.2em] text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </section>
  );
}
