"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AlertCircle, CheckCircle, Loader } from "lucide-react";

import { Button, Card, CardContent } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

export default function EmailConfirmationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirmationStatus, setConfirmationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [error, setError] = useState<string | null>(null);

  // Get email from URL params if available
  const emailFromUrl = searchParams.get("email");

  useEffect(() => {
    const handleConfirmation = async () => {
      // Wait for auth to load
      if (authLoading) return;

      try {
        if (user && user.email_confirmed_at) {
          // Email is confirmed, user is authenticated
          setConfirmationStatus("success");
        } else if (user && !user.email_confirmed_at) {
          // User exists but email not confirmed
          setError(
            "Email confirmation is still pending. Please check your email again."
          );
          setConfirmationStatus("error");
        } else {
          // No user found - they might need to complete the flow
          setError(
            "Please complete your email verification and try signing in."
          );
          setConfirmationStatus("error");
        }
      } catch (err) {
        console.error("Confirmation handling error:", err);
        setError("An error occurred while verifying your email confirmation.");
        setConfirmationStatus("error");
      }
    };

    handleConfirmation();
  }, [user, authLoading]);

  const handleContinueToSignup = () => {
    // Continue to provider signup with services step and include email if available
    const params = new URLSearchParams();
    params.set("step", "services");
    params.set("confirmed", "true");

    if (emailFromUrl) {
      params.set("email", emailFromUrl);
    }

    router.push(`/provider/signup?${params.toString()}`);
  };

  const handleSignIn = () => {
    // Redirect to sign in with email pre-filled if available
    const signInUrl = emailFromUrl
      ? `/auth/signin?email=${encodeURIComponent(emailFromUrl)}`
      : "/auth/signin";
    router.push(signInUrl);
  };

  const handleBackToSignup = () => {
    // Go back to signup with email pre-filled
    const params = new URLSearchParams();
    if (emailFromUrl) {
      params.set("email", emailFromUrl);
    }

    const signupUrl = params.toString()
      ? `/provider/signup?${params.toString()}`
      : "/provider/signup";
    router.push(signupUrl);
  };

  if (authLoading || confirmationStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="mx-auto h-12 w-12 animate-spin text-green-600" />
          <p className="mt-4 text-gray-600">
            Verifying your email confirmation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
      <div className="container mx-auto max-w-md px-4">
        <Card>
          <CardContent className="p-8 text-center">
            {confirmationStatus === "success" ? (
              <>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>

                <h1 className="mb-2 text-2xl font-bold text-green-600">
                  Email Confirmed!
                </h1>

                <p className="mb-6 text-gray-600">
                  Great! Your email has been successfully confirmed. You can now
                  continue with your provider registration.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleContinueToSignup}
                    className="w-full"
                    size="lg"
                  >
                    Continue Provider Registration
                  </Button>

                  <p className="text-sm text-gray-500">
                    You&apos;ll be taken to complete your provider profile
                    setup.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
                  <AlertCircle className="h-12 w-12 text-orange-600" />
                </div>

                <h1 className="mb-2 text-2xl font-bold text-orange-600">
                  Confirmation Issue
                </h1>

                <p className="mb-4 text-gray-600">
                  {error || "We couldn't verify your email confirmation."}
                </p>

                <div className="space-y-3">
                  <Button onClick={handleSignIn} className="w-full" size="lg">
                    Try Signing In
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleBackToSignup}
                    className="w-full"
                  >
                    Back to Signup
                  </Button>

                  <p className="text-sm text-gray-500">
                    If you continue to have issues, please{" "}
                    <Link href="/contact" className="text-green-600 underline">
                      contact support
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 underline hover:text-green-600"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
