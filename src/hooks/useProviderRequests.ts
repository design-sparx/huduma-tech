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
      setLoading(true);

      // Get available requests that match provider's services
      const allAvailable = await getAvailableRequests();
      const availableRequests = allAvailable.filter(
        request =>
          provider.services.includes(request.category) &&
          request.status === "pending" &&
          !request.providerId // Only show unassigned requests
      );

      // Get provider's requests by searching for their ID in provider_id field
      const myRequestsFilters: RequestFilters = {
        // Don't filter by status here, get all requests assigned to this provider
      };

      const allRequests = await searchRequests(myRequestsFilters);

      // Filter requests where THIS provider is assigned
      const myRequests = allRequests.filter(
        request => request.providerId === provider.id
      );

      console.log("Debug - Provider ID:", provider.id);
      console.log("Debug - All requests:", allRequests.length);
      console.log("Debug - My requests:", myRequests.length);
      console.log("Debug - Available requests:", availableRequests.length);

      // Calculate stats
      const acceptedRequests = myRequests.filter(r => r.status === "accepted");
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
          totalAccepted: acceptedRequests.length,
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
        console.log(
          "Accepting request:",
          requestId,
          "for provider:",
          provider.id
        );

        await updateServiceRequestStatus(requestId, "accepted", provider.id);

        // Refresh data after successful update
        await fetchRequests();

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
    [provider, user, fetchRequests]
  );

  // Update request status
  const updateRequestStatus = useCallback(
    async (requestId: string, status: ServiceRequest["status"]) => {
      if (!provider || !user) return false;

      setUpdating(prev => new Set(prev).add(requestId));

      try {
        console.log("Updating request status:", requestId, "to", status);

        await updateServiceRequestStatus(requestId, status);

        // Refresh data after successful update
        await fetchRequests();

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
    [provider, user, fetchRequests]
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
