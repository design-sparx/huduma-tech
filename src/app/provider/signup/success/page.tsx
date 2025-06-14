"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  CheckCircle,
  Clock,
  Home,
  LayoutDashboard,
  Mail,
  Phone,
} from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export default function ProviderSignupSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="space-y-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          {/* Success Message */}
          <div>
            <h1 className="mb-4 text-4xl font-bold text-green-600">
              Application Submitted!
            </h1>
            <p className="mb-6 text-xl text-gray-600">
              Thank you for joining HudumaTech as a service provider.
            </p>
            <p className="text-gray-600">
              Your application has been received and is now under review.
            </p>
          </div>

          {/* What Happens Next */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>What Happens Next?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 text-left">
                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <span className="text-sm font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Profile Review</h3>
                    <p className="text-sm text-gray-600">
                      Our team will review your profile, services, and
                      experience within 24-48 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <span className="text-sm font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Verification Process</h3>
                    <p className="text-sm text-gray-600">
                      We may contact you to verify your credentials and
                      experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <span className="text-sm font-bold text-green-600">4</span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Start Earning</h3>
                    <p className="text-sm text-gray-600">
                      Access your provider dashboard and start accepting service
                      requests from customers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold">Need Help?</h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-gray-600">providers@huduma.tech</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-gray-600">+254 700 123 456</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => router.push("/provider-dashboard")}
              size="lg"
              className="flex items-center space-x-2"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              size="lg"
              className="flex items-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Button>
          </div>

          {/* Additional Resources */}
          <div className="rounded-lg bg-blue-50 p-6">
            <h3 className="mb-3 font-semibold text-blue-900">
              While You Wait, Explore These Resources:
            </h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/provider-guide"
                className="block text-blue-600 underline hover:text-blue-800"
              >
                → Provider Success Guide
              </Link>
              <Link
                href="/pricing-tips"
                className="block text-blue-600 underline hover:text-blue-800"
              >
                → Setting Competitive Rates
              </Link>
              <Link
                href="/safety-guidelines"
                className="block text-blue-600 underline hover:text-blue-800"
              >
                → Safety Guidelines for Providers
              </Link>
              <Link
                href="/faq"
                className="block text-blue-600 underline hover:text-blue-800"
              >
                → Frequently Asked Questions
              </Link>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center">
            <p className="mb-4 text-gray-600">
              Join over 500+ verified providers already earning with HudumaTech
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <div>
                <div className="text-lg font-bold text-green-600">500+</div>
                <div>Active Providers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">10,000+</div>
                <div>Jobs Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">4.8★</div>
                <div>Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
