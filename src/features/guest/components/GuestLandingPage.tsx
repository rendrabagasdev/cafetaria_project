"use client";

import { useGuestData } from "../hooks/useGuestData";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { MenuSection } from "./MenuSection";
import { CTASection } from "./CTASection";
import { Footer } from "./Footer";

export function GuestLandingPage() {
  const { items, bestSellers, settings, loading } = useGuestData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header settings={settings} />
      <HeroSection settings={settings} />
      <FeaturesSection />
      <MenuSection items={items} bestSellers={bestSellers} loading={loading} />
      <CTASection />
      <Footer settings={settings} />
    </div>
  );
}
