import { useState } from "react";
import { AgeGate } from "@/components/AgeGate";
import { PromoBanner } from "@/components/PromoBanner";
import { MarqueeStrip } from "@/components/MarqueeStrip";
import { AnchorNav } from "@/components/AnchorNav";
import { Hero } from "@/components/Hero";
import { Ethos } from "@/components/Ethos";
import { GradingSystem } from "@/components/GradingSystem";
import { HowItWorks } from "@/components/HowItWorks";
import { RapSheet } from "@/components/RapSheet";
import { FAQ } from "@/components/FAQ";
import { MysteryGrid } from "@/components/MysteryGrid";
import { SocialFeeds } from "@/components/SocialFeeds";
import { Footer } from "@/components/Footer";
import { WantedList } from "@/components/WantedList";
import { SoldOutOverlay } from "@/components/SoldOutOverlay";
import { WantedListRecruitment } from "@/components/WantedListRecruitment";
import { DROP_LIVE, RECRUITMENT_MODE } from "@/lib/drop-config";
import { useDemoMode } from "@/lib/demo-mode";

const Index = () => {
  const [allSold, setAllSold] = useState(false);
  const demo = useDemoMode();
  const dropLive = demo.active ? demo.dropLive : DROP_LIVE;
  const recruitmentMode = demo.active ? demo.recruitmentMode : RECRUITMENT_MODE;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AgeGate />
      <PromoBanner />
      <MarqueeStrip />
      <AnchorNav />
      <main>
        <Hero />
        <HashHolesDrop />
        <section id="ethos" className="scroll-mt-24">
          <Ethos />
        </section>
        <section id="grading" className="scroll-mt-24">
          <GradingSystem />
        </section>
        <section id="how-it-works" className="scroll-mt-24">
          <HowItWorks />
        </section>
        <RapSheet />
        <FAQ />
        <WantedList />

        {/* Recruitment lives above the (sealed) grid as its own framed section */}
        {!dropLive && recruitmentMode && (
          <section id="recruit" className="scroll-mt-24">
            <div className="container py-12 md:py-16">
              <WantedListRecruitment overlay={false} />
            </div>
          </section>
        )}

        <MysteryGrid onAllSold={() => setAllSold(true)} />
      </main>
      <SocialFeeds />
      <Footer />
      {allSold && <SoldOutOverlay />}
      {demo.active && !demo.clean && (
        <div className="fixed bottom-3 left-3 z-[70] px-2 py-1 bg-primary text-primary-foreground font-stamp uppercase text-[10px] tracking-widest border border-tan/60 shadow-[var(--shadow-outlaw)] pointer-events-none">
          Demo Mode
        </div>
      )}
    </div>
  );
};

export default Index;
