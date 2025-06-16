"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Clock } from "lucide-react";

import { useAdminAuth } from "@/contexts";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { canAccessAdmin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !canAccessAdmin) {
      router.push("/");
    }
  }, [loading, canAccessAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto mb-2 h-8 w-8 animate-spin" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!canAccessAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-600">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              HudumaTech Admin
            </h1>
            <div className="text-muted-foreground text-sm">Admin Panel</div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
