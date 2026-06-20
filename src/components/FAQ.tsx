import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "How does the pull work?",
    a: "It's a one-armed bandit. Every pull is one flat price and always wins a sealed 7g jar — the gamble is the cut you land. Pull up to 3 jars at a time, and your jars hold in the cart for 3 minutes while you decide to lock them in.",
  },
  {
    q: "What are the tiers — AAA, EXO, F&F?",
    a: "Three cuts on the sheet. AAA ($70) is premium small-batch flower from trusted legacy operators. EXO ($100) is the top-shelf concierge tier — heavy hitters only. F&F ($110) is the rare exclusive cut: land it and the jackpot lights up.",
  },
  {
    q: "Is this legal in my state?",
    a: "All products are 2018 Farm Bill compliant. You're responsible for checking local regulations before ordering. Must be 21 or older to purchase.",
  },
  {
    q: "How's it shipped?",
    a: "Discreet, odor-sealed packaging with no branding on the outside. Ships within 1–3 business days after the drop closes. Tracking is sent to your email.",
  },
  {
    q: "Can I return a mystery jar?",
    a: "Because of the sealed, mystery nature of the drop, all sales are final once a jar is locked in. If something arrives damaged, reach out within 48 hours and we'll make it right.",
  },
  {
    q: "When's the next drop?",
    a: "Drops are announced on our socials and to our notify list. Keep an eye on the countdown above the vault — when it hits zero, the bandit goes live.",
  },
  {
    q: "Do you do wholesale?",
    a: "Yes. Reach out at mstwntdpacks@gmail.com for concierge wholesale services and custom allocations.",
  },
];

export const FAQ = () => (
  <section id="faq" className="container py-16 md:py-20 scroll-mt-24">
    <div className="text-center mb-10">
      <HelpCircle className="h-7 w-7 text-primary mx-auto mb-4" />
      <p className="font-stamp text-xs uppercase tracking-[0.3em] text-tan mb-3">— The Questions —</p>
      <h2 className="font-outlaw text-3xl sm:text-4xl md:text-5xl text-foreground text-shadow-outlaw mb-3">
        Frequently <span className="text-primary">Asked</span>
      </h2>
      <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
        Everything you need to know before you pull the lever.
      </p>
    </div>

    <div className="max-w-2xl mx-auto">
      <Accordion type="single" collapsible className="space-y-2">
        {FAQS.map((f, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border border-border bg-card/40 px-5 data-[state=open]:border-primary/50 transition-smooth"
          >
            <AccordionTrigger className="font-stamp uppercase text-xs sm:text-sm tracking-widest text-foreground hover:text-primary hover:no-underline text-left">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
