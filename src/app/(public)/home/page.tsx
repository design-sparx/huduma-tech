"use client";

import { useState } from "react";

import {
  HeroBlock,
  ServiceCategoriesBlock,
  StatsBlock,
} from "@/app/(public)/home/blocks";
import { BecomeProviderCTA } from "@/components/shared";

export default function HomePage() {
  const [_showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="space-y-8">
      <HeroBlock onShowAuth={() => setShowAuthModal(true)} />
      <ServiceCategoriesBlock />
      <StatsBlock />
      <BecomeProviderCTA variant="card" />
    </div>
  );
}
