"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getServiceProviders } from "@/lib/services/providers";

import type { ServiceCategory, ServiceProvider } from "@/types";

interface UseServiceProvidersProps {
  category?: ServiceCategory;
  location?: string;
  searchTerm?: string;
  minRating?: number;
  maxRate?: number;
  sortBy?: "rating" | "hourly_rate" | "total_jobs" | "name";
  sortOrder?: "asc" | "desc";
  debounceMs?: number;
  enabled?: boolean; // Allow disabling the hook
}

interface UseServiceProvidersReturn {
  providers: ServiceProvider[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasResults: boolean;
  totalCount: number;
}

export function useServiceProviders(
  filters?: UseServiceProvidersProps
): UseServiceProvidersReturn {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to track the latest request to prevent race conditions
  const latestRequestId = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout>(null);

  // Extract and memoize filter values to prevent unnecessary re-renders
  const filterValues = useMemo(
    () => ({
      category: filters?.category,
      location: filters?.location,
      searchTerm: filters?.searchTerm,
      minRating: filters?.minRating,
      maxRate: filters?.maxRate,
      sortBy: filters?.sortBy || "rating",
      sortOrder: filters?.sortOrder || "desc",
      debounceMs: filters?.debounceMs ?? 300,
      enabled: filters?.enabled ?? true,
    }),
    [
      filters?.category,
      filters?.location,
      filters?.searchTerm,
      filters?.minRating,
      filters?.maxRate,
      filters?.sortBy,
      filters?.sortOrder,
      filters?.debounceMs,
      filters?.enabled,
    ]
  );

  useEffect(() => {
    // Don't fetch if disabled
    if (!filterValues.enabled) {
      return;
    }

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Increment request ID for this request
    const requestId = ++latestRequestId.current;

    // Determine if we should debounce (only for search terms)
    const shouldDebounce =
      filterValues.searchTerm && filterValues.searchTerm.trim().length > 0;
    const delay = shouldDebounce ? filterValues.debounceMs : 0;

    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getServiceProviders({
          category: filterValues.category,
          location: filterValues.location,
          searchTerm: filterValues.searchTerm,
          minRating: filterValues.minRating,
          maxRate: filterValues.maxRate,
          sortBy: filterValues.sortBy,
          sortOrder: filterValues.sortOrder,
        });

        // Only update state if this is still the latest request
        if (requestId === latestRequestId.current) {
          setProviders(data);
        }
      } catch (err: any) {
        // Only update error state if this is still the latest request
        if (requestId === latestRequestId.current) {
          setError(err.message || "Failed to fetch service providers");
          // console.error("Error fetching providers:", err);
        }
      } finally {
        // Only update loading state if this is still the latest request
        if (requestId === latestRequestId.current) {
          setLoading(false);
        }
      }
    };

    // Set up debounced fetch
    debounceTimer.current = setTimeout(fetchProviders, delay);

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filterValues]);

  // Manual refetch function (no debounce)
  const refetch = () => {
    if (!filterValues.enabled) return;

    const requestId = ++latestRequestId.current;

    setLoading(true);
    setError(null);

    getServiceProviders({
      category: filterValues.category,
      location: filterValues.location,
      searchTerm: filterValues.searchTerm,
      minRating: filterValues.minRating,
      maxRate: filterValues.maxRate,
      sortBy: filterValues.sortBy,
      sortOrder: filterValues.sortOrder,
    })
      .then(data => {
        if (requestId === latestRequestId.current) {
          setProviders(data);
        }
      })
      .catch(err => {
        if (requestId === latestRequestId.current) {
          setError(err.message || "Failed to fetch service providers");
          console.error("Error fetching providers:", err);
        }
      })
      .finally(() => {
        if (requestId === latestRequestId.current) {
          setLoading(false);
        }
      });
  };

  // Computed values
  const hasResults = providers.length > 0;
  const totalCount = providers.length;

  return {
    providers,
    loading,
    error,
    refetch,
    hasResults,
    totalCount,
  };
}
