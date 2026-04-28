import { useState } from "react";
import { AgeGate } from "@/components/AgeGate";
import { PromoBanner } from "@/components/PromoBanner";
import { AnchorNav } from "@/components/AnchorNav";
import { Hero } from "@/components/Hero";
import { Ethos } from "@/components/Ethos";
import { GradingSystem } from "@/components/GradingSystem";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { MysteryGrid } from "@/components/MysteryGrid";
import { SocialFeeds } from "@/components/SocialFeeds";
import { Footer } from "@/components/Footer";
import { SoldOutOverlay } from "@/components/SoldOutOverlay";

const Index = () => {
  const [allSold, setAllSold] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AgeGate />
      <PromoBanner />
      <AnchorNav />
      <main>
        <Hero />
        <section id="ethos" className="scroll-mt-24">
          <Ethos />
        </section>
        <section id="grading" className="scroll-mt-24">
          <GradingSystem />
        </section>
        <section id="how-it-works" className="scroll-mt-24">
          <HowItWorks />
        </section>
        <FAQ />
        <MysteryGrid onAllSold={() => setAllSold(true)} />
      </main>
      <SocialFeeds />
      <Footer />
      {allSold && <SoldOutOverlay />}
    </div>
  );
};

export default Index;
