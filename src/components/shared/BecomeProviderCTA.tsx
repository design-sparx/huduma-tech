"use client";

import Link from "next/link";

import { ArrowRight, DollarSign, Star, TrendingUp, Users } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

interface BecomeProviderCTAProps {
  variant?: "banner" | "card" | "inline";
  className?: string;
}

export function BecomeProviderCTA({
  variant = "card",
  className = "",
}: BecomeProviderCTAProps) {
  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Extra Income",
      description: "Set your own rates and work on your schedule",
    },
    {
      icon: Users,
      title: "Growing Customer Base",
      description: "Access thousands of customers across Kenya",
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Get reviews and build a trusted profile",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Scale your services and increase earnings",
    },
  ];

  if (variant === "banner") {
    return (
      <div
        className={`bg-gradient-to-r from-green-600 to-green-700 py-16 text-white ${className}`}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Grow Your Business?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-green-100">
            Join HudumaTech as a service provider and connect with customers who
            need your skills.
          </p>

          <div className="mx-auto mb-8 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="mx-auto mb-2 h-8 w-8 text-green-200" />
                  <h3 className="text-sm font-semibold">{benefit.title}</h3>
                  <p className="mt-1 text-xs text-green-200">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          <Button
            asChild
            size="lg"
            className="bg-white text-green-600 hover:bg-green-50"
          >
            <Link
              href="/provider/signup"
              className="flex items-center space-x-2"
            >
              <span>Become a Provider</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`rounded-lg border border-green-200 bg-green-50 p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-800">
              Are you a service provider?
            </h3>
            <p className="text-sm text-green-600">
              Join our platform and start earning with your skills
            </p>
          </div>
          <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
            <Link href="/provider/signup">Join Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-green-600">
          Become a Service Provider
        </CardTitle>
        <p className="text-gray-600">
          Turn your skills into income and join Kenya&apos;s growing service
          economy
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Benefits List */}
        <div className="space-y-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Icon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 py-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">500+</div>
            <div className="text-xs text-gray-600">Active Providers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">4.8★</div>
            <div className="text-xs text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button asChild size="lg" className="w-full">
            <Link
              href="/provider/signup"
              className="flex items-center justify-center space-x-2"
            >
              <span>Start Your Provider Journey</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-2 text-xs text-gray-500">
            Free to join • Start earning today
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
