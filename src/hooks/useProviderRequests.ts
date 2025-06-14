"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getAvailableRequests,
  type RequestFilters,
  searchRequests,
  updateServiceRequestStatus,
} from "@/lib/services/requests";

import { useAuth } from "./useAuth";

import type { ServiceProvider, ServiceRequest } from "@/types";

interface UseProviderRequestsOptions {
  provider?: ServiceProvider;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ProviderRequestsData {
  availableRequests: ServiceRequest[];
  myRequests: ServiceRequest[];
  stats: {
    totalAvailable: number;
    totalAccepted: number;
    activeJobs: number;
    completedJobs: number;
    totalEarnings: number;
  };
}

export function useProviderRequests(options: UseProviderRequestsOptions = {}) {
  const { user } = useAuth();
  const { provider, autoRefresh = false, refreshInterval = 30000 } = options;

  const [data, setData] = useState<ProviderRequestsData>({
    availableRequests: [],
    myRequests: [],
    stats: {
      totalAvailable: 0,
      totalAccepted: 0,
      activeJobs: 0,
      completedJobs: 0,
      totalEarnings: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  // Fetch all provider requests
  const fetchRequests = useCallback(async () => {
    if (!provider || !user) {
      setData({
        availableRequests: [],
        myRequests: [],
        stats: {
          totalAvailable: 0,
          totalAccepted: 0,
          activeJobs: 0,
          completedJobs: 0,
          totalEarnings: 0,
        },
      });
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Get available requests that match provider's services
      const allAvailable = await getAvailableRequests();
      const availableRequests = allAvailable.filter(
        request =>
          provider.services.includes(request.category) &&
          request.status === "pending"
      );

      // Get provider's accepted/active requests
      const myRequestsFilters: RequestFilters = {
        status: ["accepted", "in_progress", "completed"],
      };

      const allRequests = await searchRequests(myRequestsFilters);
      const myRequests = allRequests.filter(
        request => request.providerId === provider.id
      );

      // Calculate stats
      const activeJobs = myRequests.filter(
        r => r.status === "accepted" || r.status === "in_progress"
      ).length;

      const completedJobs = myRequests.filter(
        r => r.status === "completed"
      ).length;

      const totalEarnings = myRequests
        .filter(r => r.status === "completed")
        .reduce((sum, r) => sum + r.budget, 0);

      const newData: ProviderRequestsData = {
        availableRequests,
        myRequests,
        stats: {
          totalAvailable: availableRequests.length,
          totalAccepted: myRequests.length,
          activeJobs,
          completedJobs,
          totalEarnings,
        },
      };

      setData(newData);
    } catch (err) {
      setError("Failed to fetch provider requests");
      console.error("Error fetching provider requests:", err);
    } finally {
      setLoading(false);
    }
  }, [provider, user]);

  // Accept a request
  const acceptRequest = useCallback(
    async (requestId: string) => {
      if (!provider || !user) return false;

      setUpdating(prev => new Set(prev).add(requestId));

      try {
        await updateServiceRequestStatus(requestId, "accepted", provider.id);

        // Update local state
        setData(prev => {
          const request = prev.availableRequests.find(r => r.id === requestId);
          if (!request) return prev;

          const updatedRequest = {
            ...request,
            status: "accepted" as const,
            providerId: provider.id,
            provider: {
              name: provider.name,
              phone: provider.phone,
              email: provider.email,
              rating: provider.rating,
              verified: provider.verified,
            },
          };

          return {
            ...prev,
            availableRequests: prev.availableRequests.filter(
              r => r.id !== requestId
            ),
            myRequests: [...prev.myRequests, updatedRequest],
            stats: {
              ...prev.stats,
              totalAvailable: prev.stats.totalAvailable - 1,
              totalAccepted: prev.stats.totalAccepted + 1,
              activeJobs: prev.stats.activeJobs + 1,
            },
          };
        });

        return true;
      } catch (err) {
        console.error("Error accepting request:", err);
        throw err;
      } finally {
        setUpdating(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    [provider, user]
  );

  // Update request status
  const updateRequestStatus = useCallback(
    async (requestId: string, status: ServiceRequest["status"]) => {
      if (!provider || !user) return false;

      setUpdating(prev => new Set(prev).add(requestId));

      try {
        await updateServiceRequestStatus(requestId, status);

        // Update local state
        setData(prev => {
          const updatedMyRequests = prev.myRequests.map(req => {
            if (req.id === requestId) {
              return { ...req, status };
            }
            return req;
          });

          // Recalculate stats
          const activeJobs = updatedMyRequests.filter(
            r => r.status === "accepted" || r.status === "in_progress"
          ).length;

          const completedJobs = updatedMyRequests.filter(
            r => r.status === "completed"
          ).length;

          const totalEarnings = updatedMyRequests
            .filter(r => r.status === "completed")
            .reduce((sum, r) => sum + r.budget, 0);

          return {
            ...prev,
            myRequests: updatedMyRequests,
            stats: {
              ...prev.stats,
              activeJobs,
              completedJobs,
              totalEarnings,
            },
          };
        });

        return true;
      } catch (err) {
        console.error("Error updating request status:", err);
        throw err;
      } finally {
        setUpdating(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    [provider, user]
  );

  // Get requests by status
  const getRequestsByStatus = useCallback(
    (status: ServiceRequest["status"]) => {
      return data.myRequests.filter(req => req.status === status);
    },
    [data.myRequests]
  );

  // Get request by ID
  const getRequestById = useCallback(
    (requestId: string) => {
      return (
        data.availableRequests.find(r => r.id === requestId) ||
        data.myRequests.find(r => r.id === requestId) ||
        null
      );
    },
    [data.availableRequests, data.myRequests]
  );

  // Check if request is being updated
  const isUpdating = useCallback(
    (requestId: string) => {
      return updating.has(requestId);
    },
    [updating]
  );

  // Manual refetch
  const refetch = useCallback(async () => {
    await fetchRequests();
  }, [fetchRequests]);

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !provider || !user) return;

    const interval = setInterval(() => {
      fetchRequests();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, provider, user, fetchRequests]);

  return {
    // Data
    availableRequests: data.availableRequests,
    myRequests: data.myRequests,
    stats: data.stats,

    // State
    loading,
    error,

    // Actions
    acceptRequest,
    updateRequestStatus,
    refetch,

    // Getters
    getRequestsByStatus,
    getRequestById,

    // Utilities
    isUpdating,

    // Computed values
    hasAvailableRequests: data.availableRequests.length > 0,
    hasActiveJobs: data.stats.activeJobs > 0,
    hasCompletedJobs: data.stats.completedJobs > 0,
  };
}
