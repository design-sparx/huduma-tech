"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Calendar, Plus, Search, Settings } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useServiceRequests } from "@/hooks/useServiceRequests";

interface MobileNavProps {
  onShowAuth: () => void;
}

export function MobileNav({ onShowAuth }: MobileNavProps) {
  const { user } = useAuth();
  const { requests } = useServiceRequests();
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Settings, label: "Home", protected: false },
    { href: "/search", icon: Search, label: "Search", protected: false },
    { href: "/request", icon: Plus, label: "Request", protected: true },
    {
      href: "/my-requests",
      icon: Calendar,
      label: "Requests",
      protected: true,
    },
  ];

  return (
    <div className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white px-4 py-2 md:hidden">
      <div className="flex justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.protected && !user) {
            return (
              <button
                key={item.href}
                onClick={onShowAuth}
                className={`flex flex-col items-center rounded-lg px-3 py-2 ${
                  isActive ? "text-green-600" : "text-gray-600"
                }`}
              >
                <Icon className="mb-1 h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center rounded-lg px-3 py-2 ${
                isActive ? "text-green-600" : "text-gray-600"
              }`}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span className="text-xs">{item.label}</span>
              {item.href === "/my-requests" && user && requests.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {requests.length}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
