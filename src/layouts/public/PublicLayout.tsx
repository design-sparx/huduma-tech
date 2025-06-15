"use client";

import { useState } from "react";

import { AuthModal } from "@/components/shared";
import { useAuth } from "@/contexts";

import { Header, MobileNav } from "./components";

import type { ReactNode } from "react";

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  const { loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onShowAuth={() => setShowAuthModal(true)} />

      <main className="container mx-auto px-4 py-8">{children}</main>

      <MobileNav onShowAuth={() => setShowAuthModal(true)} />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};
