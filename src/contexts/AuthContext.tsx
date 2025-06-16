"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { checkUserIsAdmin } from "@/lib/services/admin";
import { supabase } from "@/lib/supabase";

import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        setUser(null);
        setIsAdmin(false);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const adminStatus = await checkUserIsAdmin(currentUser.id);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error in refreshAuth:", error);
      setUser(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Get initial session and check admin status
    const getInitialSession = async () => {
      setLoading(true);
      await refreshAuth();
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Check admin status for new user
        try {
          const adminStatus = await checkUserIsAdmin(currentUser.id);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Custom hook for admin-only operations
export function useAdminAuth() {
  const { user, isAdmin, loading } = useAuth();

  return {
    user,
    isAdmin,
    loading,
    canAccessAdmin: !loading && user && isAdmin,
  };
}

// Optional: Export for direct context access
export { AuthContext };
