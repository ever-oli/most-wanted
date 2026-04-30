import { useState } from "react";
import { AgeGate } from "@/components/AgeGate";
import { PromoBanner } from "@/components/PromoBanner";
import { MarqueeStrip } from "@/components/MarqueeStrip";
import { AnchorNav } from "@/components/AnchorNav";
import { Hero } from "@/components/Hero";
import { Ethos } from "@/components/Ethos";
import { GradingSystem } from "@/components/GradingSystem";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { MysteryGrid } from "@/components/MysteryGrid";
import { SocialFeeds } from "@/components/SocialFeeds";
import { Footer } from "@/components/Footer";
import { WantedList } from "@/components/WantedList";
import { SoldOutOverlay } from "@/components/SoldOutOverlay";
import { StampedDivider } from "@/components/StampedDivider";
import { WantedListRecruitment } from "@/components/WantedListRecruitment";
import { DROP_LIVE, RECRUITMENT_MODE } from "@/lib/drop-config";

const Index = () => {
  const [allSold, setAllSold] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AgeGate />
      <PromoBanner />
      <MarqueeStrip />
      <AnchorNav />
      <main>
        <Hero />
        <StampedDivider label="Ethos" />
        <section id="ethos" className="scroll-mt-24">
          <Ethos />
        </section>
        <StampedDivider label="Grading" />
        <section id="grading" className="scroll-mt-24">
          <GradingSystem />
        </section>
        <StampedDivider label="How It Works" />
        <section id="how-it-works" className="scroll-mt-24">
          <HowItWorks />
        </section>
        <StampedDivider label="FAQ" />
        <FAQ />
        <WantedList />

        {/* Recruitment lives above the (sealed) grid as its own framed section */}
        {!DROP_LIVE && RECRUITMENT_MODE && (
          <section id="recruit" className="scroll-mt-24">
            <div className="container py-12 md:py-16">
              <WantedListRecruitment overlay={false} />
            </div>
          </section>
        )}

        <StampedDivider label="The Vault" />
        <MysteryGrid onAllSold={() => setAllSold(true)} />
      </main>
      <StampedDivider label="The Feed" />
      <SocialFeeds />
      <Footer />
      {allSold && <SoldOutOverlay />}
    </div>
  );
};

export default Index;
