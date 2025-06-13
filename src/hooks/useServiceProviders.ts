"use client";

import { useCallback, useEffect, useState } from "react";

import { getServiceProviders } from "@/lib/services/providers";

import type { ServiceCategory, ServiceProvider } from "@/types";

interface UseServiceProvidersProps {
  category?: ServiceCategory;
  location?: string;
  searchTerm?: string;
}

export function useServiceProviders(filters?: UseServiceProvidersProps) {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceProviders(filters);
      setProviders(data);
    } catch (err: any) {
      setError(`Failed to fetch service providers: ${err.toString()}`);
      // console.error("Error fetching providers:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const refetch = () => {
    fetchProviders();
  };

  return { providers, loading, error, refetch };
}
