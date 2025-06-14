"use client";

import { useCallback, useEffect, useState } from "react";

import {
  deleteServiceRequest,
  getUserServiceRequests,
  type RequestFilters,
  searchRequests,
  updateServiceRequest,
  updateServiceRequestStatus,
} from "@/lib/services/requests";

import { useAuth } from "./useAuth";

import type { ServiceRequest } from "@/types";

interface UseServiceRequestsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: RequestFilters;
}

interface RequestStats {
  total: number;
  pending: number;
  accepted: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
}

export function useServiceRequests(options: UseServiceRequestsOptions = {}) {
  const { user } = useAuth();
  const { autoRefresh = false, refreshInterval = 30000, filters } = options;

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const fetchRequests = useCallback(async () => {
    if (!user) {
      setRequests([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);

      let data: ServiceRequest[];

      if (filters) {
        // Use search with filters
        data = await searchRequests({ ...filters, userId: user.id });
      } else {
        // Use basic fetch
        data = await getUserServiceRequests(user.id);
      }

      setRequests(data);

      // Calculate stats
      const requestStats: RequestStats = data.reduce(
        (acc, request) => {
          acc.total++;
          acc[
            request.status as keyof Omit<RequestStats, "total" | "totalSpent">
          ]++;
          if (request.status === "completed") {
            acc.totalSpent += request.budget;
          }
          return acc;
        },
        {
          total: 0,
          pending: 0,
          accepted: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
          totalSpent: 0,
        }
      );

      setStats(requestStats);
    } catch (err) {
      setError(`Failed to fetch service requests: ${err}`);
      // console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const refetch = useCallback(async () => {
    await fetchRequests();
  }, [fetchRequests]);

  // Update a specific request
  const updateRequest = useCallback(
    async (
      requestId: string,
      updates: Partial<Omit<ServiceRequest, "id" | "userId" | "createdAt">>
    ) => {
      if (!user) return null;

      setUpdating(prev => new Set(prev).add(requestId));

      try {
        const updatedRequest = await updateServiceRequest(requestId, updates);

        // Update local state
        setRequests(prev =>
          prev.map(req => (req.id === requestId ? updatedRequest : req))
        );

        return updatedRequest;
      } catch (err) {
        // console.error("Error updating request:", err);
        throw err;
      } finally {
        setUpdating(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    [user]
  );

  // Update request status
  const updateStatus = useCallback(
    async (
      requestId: string,
      status: ServiceRequest["status"],
      providerId?: string
    ) => {
      if (!user) return null;

      setUpdating(prev => new Set(prev).add(requestId));

      try {
        await updateServiceRequestStatus(requestId, status, providerId);

        // Refetch to get updated data with provider info
        await refetch();
      } catch (err) {
        // console.error("Error updating request status:", err);
        throw err;
      } finally {
        setUpdating(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    [user, refetch]
  );

  // Cancel/Delete a request
  const cancelRequest = useCallback(
    async (requestId: string) => {
      if (!user) return false;

      setUpdating(prev => new Set(prev).add(requestId));

      try {
        // If request is pending, we can cancel it (set status to cancelled)
        // If we want to actually delete it, we can use deleteServiceRequest
        await updateServiceRequestStatus(requestId, "cancelled");

        // Update local state
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? { ...req, status: "cancelled" as const }
              : req
          )
        );

        return true;
      } catch (err) {
        // console.error("Error cancelling request:", err);
        throw err;
      } finally {
        setUpdating(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    [user]
  );

  // Delete a request permanently
  const deleteRequest = useCallback(
    async (requestId: string) => {
      if (!user) return false;

      setUpdating(prev => new Set(prev).add(requestId));

      try {
        await deleteServiceRequest(requestId);

        // Remove from local state
        setRequests(prev => prev.filter(req => req.id !== requestId));

        return true;
      } catch (err) {
        // console.error("Error deleting request:", err);
        throw err;
      } finally {
        setUpdating(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    [user]
  );

  // Get a specific request by ID
  const getRequest = useCallback(
    (requestId: string) => {
      return requests.find(req => req.id === requestId) || null;
    },
    [requests]
  );

  // Get requests by status
  const getRequestsByStatus = useCallback(
    (status: ServiceRequest["status"]) => {
      return requests.filter(req => req.status === status);
    },
    [requests]
  );

  // Get requests by category
  const getRequestsByCategory = useCallback(
    (category: string) => {
      return requests.filter(req => req.category === category);
    },
    [requests]
  );

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !user) return;

    const interval = setInterval(() => {
      fetchRequests();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, user, fetchRequests]);

  // Utility functions
  const isUpdating = useCallback(
    (requestId: string) => {
      return updating.has(requestId);
    },
    [updating]
  );

  const hasRequests = requests.length > 0;
  const hasPendingRequests = requests.some(req => req.status === "pending");
  const hasActiveRequests = requests.some(
    req => req.status === "accepted" || req.status === "in_progress"
  );

  return {
    // Data
    requests,
    stats,

    // State
    loading,
    error,
    hasRequests,
    hasPendingRequests,
    hasActiveRequests,

    // Actions
    refetch,
    updateRequest,
    updateStatus,
    cancelRequest,
    deleteRequest,

    // Getters
    getRequest,
    getRequestsByStatus,
    getRequestsByCategory,

    // Utilities
    isUpdating,
  };
}
