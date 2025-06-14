"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogOut, Settings, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { signOut } from "@/lib/services/auth";
import { getServiceProviderByEmail } from "@/lib/services/providers";

interface HeaderProps {
  onShowAuth: () => void;
}

export function Header({ onShowAuth }: HeaderProps) {
  const { user } = useAuth();
  const { requests } = useServiceRequests();
  const pathname = usePathname();
  const [error, setError] = useState("");
  const [isProvider, setIsProvider] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  // Check if user is a provider
  useEffect(() => {
    const checkProviderStatus = async () => {
      if (!user?.email) {
        setIsProvider(false);
        return;
      }

      setProviderLoading(true);
      try {
        const provider = await getServiceProviderByEmail(user.email);
        setIsProvider(!!provider);
      } catch (error) {
        setIsProvider(false);
        console.error("Error checking provider status:", error);
      } finally {
        setProviderLoading(false);
      }
    };

    checkProviderStatus();
  }, [user?.email]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      setError(`Error signing out ${error.toString()}`);
    }
  };

  // Navigation items for customers
  const customerNavItems = [
    { href: "/", label: "Home", protected: false },
    { href: "/search", label: "Find Services", protected: false },
    { href: "/request", label: "Request Service", protected: true },
    {
      href: "/my-requests",
      label: `My Requests${user && requests.length > 0 ? ` (${requests.length})` : ""}`,
      protected: true,
    },
  ];

  // Navigation items for providers
  const providerNavItems = [
    { href: "/", label: "Home", protected: false },
    {
      href: "/provider/dashboard", // Updated to match new route structure
      label: "Provider Dashboard",
      protected: true,
    },
    { href: "/search", label: "Find Services", protected: false },
  ];

  // Choose nav items based on user type
  const navItems = isProvider ? providerNavItems : customerNavItems;

  if (error) {
    return <p>An error occurred while signing out</p>;
  }

  return (
    <header className="border-b-2 border-green-500 bg-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-lg bg-green-600 p-2">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-700">HudumaTech</h1>
            <span className="hidden text-sm text-gray-500 sm:block">
              Kenya&apos;s Premier Service Platform
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <nav className="hidden space-x-6 md:flex">
              {navItems.map(item => {
                const isActive = pathname === item.href;

                if (item.protected && !user) {
                  return (
                    <button
                      key={item.href}
                      onClick={() => onShowAuth()}
                      className={`rounded-lg px-4 py-2 transition-colors ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "text-gray-600 hover:text-green-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-4 py-2 transition-colors ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:text-green-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Provider Signup CTA for non-providers */}
            {user && !isProvider && !providerLoading && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden items-center space-x-1 border-green-600 text-green-600 hover:bg-green-50 md:flex"
              >
                <Link href="/provider/signup">
                  <UserPlus className="h-4 w-4" />
                  <span>Become a Provider</span>
                </Link>
              </Button>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden text-sm text-gray-600 lg:block">
                  Welcome,{" "}
                  <span className="font-medium">
                    {user.user_metadata?.name || user.email}
                  </span>
                  {!providerLoading && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({isProvider ? "Provider" : "Customer"})
                    </span>
                  )}
                </div>

                {/* Quick switch button for providers */}
                {isProvider && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentPath = pathname;
                      if (currentPath === "/provider/dashboard") {
                        window.location.href = "/my-requests";
                      } else {
                        window.location.href = "/provider/dashboard";
                      }
                    }}
                    className="text-xs"
                  >
                    {pathname === "/provider/dashboard"
                      ? "Customer View"
                      : "Provider View"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Provider signup for non-authenticated users */}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden text-green-600 hover:text-green-700 sm:flex"
                >
                  <Link href="/provider/signup">Become a Provider</Link>
                </Button>
                <Button onClick={onShowAuth}>Sign In</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
