"use client";

import { useEffect, useState } from "react";

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

  const category = filters?.category;
  const location = filters?.location;
  const searchTerm = filters?.searchTerm;

  useEffect(() => {
    let isCancelled = false; // Cleanup flag to prevent state updates if component unmounts

    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getServiceProviders({
          category,
          location,
          searchTerm,
        });

        // Only update state if the effect hasn't been cancelled
        if (!isCancelled) {
          setProviders(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(
            `Failed to fetch service providers: ${err.message || err.toString()}`
          );
          // console.error("Error fetching providers:", err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProviders();

    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, [category, location, searchTerm]); // Depend on primitive values, not the object

  const refetch = () => {
    setLoading(true);
    setError(null);

    getServiceProviders({ category, location, searchTerm })
      .then(data => {
        setProviders(data);
      })
      .catch(err => {
        setError(
          `Failed to fetch service providers: ${err.message || err.toString()}`
        );
        console.error("Error fetching providers:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { providers, loading, error, refetch };
}
