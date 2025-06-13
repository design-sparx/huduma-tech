"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { signOut } from "@/lib/services/auth";

interface HeaderProps {
  onShowAuth: () => void;
}

export function Header({ onShowAuth }: HeaderProps) {
  const { user } = useAuth();
  const { requests } = useServiceRequests();
  const pathname = usePathname();
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      // console.error("Error signing out:", error);
      setError(`Error signing out ${error.toString()}`);
    }
  };

  const navItems = [
    { href: "/", label: "Home", protected: false },
    { href: "/search", label: "Find Services", protected: false },
    { href: "/request", label: "Request Service", protected: true },
    {
      href: "/my-requests",
      label: `My Requests${user && requests.length > 0 ? ` (${requests.length})` : ""}`,
      protected: true,
    },
  ];

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
            <span className="text-sm text-gray-500">
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

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden text-sm text-gray-600 md:block">
                  Welcome,{" "}
                  <span className="font-medium">
                    {user.user_metadata?.name || user.email}
                  </span>
                </div>
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
              <Button onClick={onShowAuth}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
