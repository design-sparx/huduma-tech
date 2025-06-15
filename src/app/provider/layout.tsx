"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AlertCircle, Loader } from "lucide-react";

import { Button, Card, CardContent } from "@/components/ui";
import { useAuth } from "@/contexts";
import { getServiceProviderByEmail } from "@/lib/services/providers";

import type { ServiceProvider } from "@/types";

interface ProviderLayoutProps {
  children: React.ReactNode;
}

export default function ProviderLayout({ children }: ProviderLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [_provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProviderAccess = async () => {
      // Wait for auth to load
      if (authLoading) return;

      // Redirect if not authenticated
      if (!user) {
        router.push("/");
        return;
      }

      // Check if user is a provider
      if (!user.email) {
        setError("User email not found");
        setLoading(false);
        return;
      }

      try {
        const providerData = await getServiceProviderByEmail(user.email);
        setProvider(providerData);

        // Allow access to signup even if not yet a provider
        const isSignupRoute = window.location.pathname.includes("/signup");
        if (!providerData && !isSignupRoute) {
          setError("Provider account not found");
        }
      } catch (err) {
        console.error("Error checking provider status:", err);
        setError("Failed to verify provider status");
      } finally {
        setLoading(false);
      }
    };

    checkProviderAccess();
  }, [user, authLoading, router]);

  // Show loading while checking auth and provider status
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="mx-auto h-12 w-12 animate-spin text-green-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error or redirect if not a provider (except for signup routes)
  const isSignupRoute =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/signup");

  if (error && !isSignupRoute) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-orange-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Provider Account Required
            </h3>
            <p className="mb-4 text-gray-600">
              {error ||
                "You need to be registered as a service provider to access this page."}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => router.push("/provider/signup")}>
                Become a Provider
              </Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render children for valid providers or signup routes
  return <>{children}</>;
}
