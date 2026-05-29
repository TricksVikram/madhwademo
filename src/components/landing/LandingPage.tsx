import { LandingNavbar } from "./LandingNavbar";
import { HeroSection } from "./HeroSection";
import { DashboardMockup } from "./DashboardMockup";
import { SocialProofBar } from "./SocialProofBar";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";

import { TestimonialsSection } from "./TestimonialsSection";
import { FAQSection } from "./FAQSection";
import { CTABanner } from "./CTABanner";
import { LandingFooter } from "./LandingFooter";



export function LandingPage() {
  return (
    <div className="min-h-screen w-full scroll-smooth bg-background text-foreground" data-testid="page-landing">
      <div className="bg-card">
        <LandingNavbar />
        <HeroSection />
      </div>
        <div className="bg-foreground px-4 pt-12 pb-12 md:px-8 md:pt-16 md:pb-16">
          <div className="relative mx-auto max-w-5xl -mt-32 md:-mt-44">
            <DashboardMockup />
          </div>
          <SocialProofBar />
        </div>
        <FeaturesSection />
        <HowItWorksSection />
        
        <TestimonialsSection />
        <FAQSection />
        <CTABanner />
      <LandingFooter />
      
      
    </div>
  );
}
