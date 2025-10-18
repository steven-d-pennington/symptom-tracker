import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsGrid } from "@/components/landing/BenefitsGrid";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { FinalCTA } from "@/components/landing/FinalCTA";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <BenefitsGrid />
      <FeatureShowcase />
      <HowItWorks />
      <PrivacySection />
      <FinalCTA />
    </div>
  );
};

export default HomePage;
