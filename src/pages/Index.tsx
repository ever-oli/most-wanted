import { useState } from "react";
import { AgeGate } from "@/components/AgeGate";
import { PromoBanner } from "@/components/PromoBanner";
import { Hero } from "@/components/Hero";
import { Ethos } from "@/components/Ethos";
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
        <Ethos />
        <GradingSystem />
        <HowItWorks />
        <MysteryGrid onAllSold={() => setAllSold(true)} />
      </main>
      <SocialFeeds />
      <Footer />
      {allSold && <SoldOutOverlay />}
    </div>
  );
};

export default Index;
