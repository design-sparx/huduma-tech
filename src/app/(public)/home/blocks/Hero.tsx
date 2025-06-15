"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";

interface HeroSectionProps {
  onShowAuth: () => void;
}

export function HeroBlock({ onShowAuth }: HeroSectionProps) {
  const { user } = useAuth();

  return (
    <div className="rounded-xl bg-gradient-to-r from-green-600 to-blue-600 p-8 text-center text-white">
      <h2 className="mb-4 text-4xl font-bold">
        Connect with Trusted Professionals
      </h2>
      <p className="mb-6 text-xl">
        Find verified electricians, plumbers, mechanics, and more across Kenya
      </p>
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button
          asChild
          className="bg-white px-8 py-3 text-lg text-green-600 hover:bg-gray-100"
        >
          <Link href="/search">Find Services</Link>
        </Button>
        {user ? (
          <Button
            asChild
            variant="outline"
            className="border-white px-8 py-3 text-lg text-white hover:bg-white hover:text-green-600"
          >
            <Link href="/request">Request Service</Link>
          </Button>
        ) : (
          <Button
            onClick={onShowAuth}
            variant="outline"
            className="border-white px-8 py-3 text-lg text-white hover:bg-white hover:text-green-600"
          >
            Request Service
          </Button>
        )}
      </div>
    </div>
  );
}
