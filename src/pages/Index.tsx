import { useState } from "react";
import { AgeGate } from "@/components/AgeGate";
import { PromoBanner } from "@/components/PromoBanner";
import { Hero } from "@/components/Hero";
import { Ethos } from "@/components/Ethos";
import { Testimonials } from "@/components/Testimonials";
import { GradingSystem } from "@/components/GradingSystem";
import { HowItWorks } from "@/components/HowItWorks";
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
      <main>
        <Hero />
        <section id="ethos">
          <Ethos />
        </section>
        <Testimonials />
        <section id="grading">
          <GradingSystem />
        </section>
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <MysteryGrid onAllSold={() => setAllSold(true)} />
      </main>
      <SocialFeeds />
      <Footer />
      {allSold && <SoldOutOverlay />}
    </div>
  );
};

export default Index;
