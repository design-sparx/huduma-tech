// src/hooks/useConversations.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/contexts"; // Use your auth context
import {
  getProviderConversations,
  getUserConversations,
} from "@/lib/services/messaging";

import type { ConversationSummary } from "@/types";

interface UseConversationsOptions {
  userType: "user" | "provider";
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useConversations(options: UseConversationsOptions) {
  const { userType, autoRefresh = false, refreshInterval = 30000 } = options;
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to prevent unnecessary re-fetches
  const lastFetchRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);
  const userIdRef = useRef<string | null>(null);

  // Fetch conversations with optimization
  const fetchConversations = useCallback(async () => {
    // Skip if user is not available
    if (!user?.id) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Skip if user hasn't changed and it's been less than 1 second since last fetch
    const now = Date.now();
    const hasUserChanged = userIdRef.current !== user.id;
    const timeSinceLastFetch = now - lastFetchRef.current;

    if (
      !isInitialLoadRef.current &&
      !hasUserChanged &&
      timeSinceLastFetch < 1000
    ) {
      return;
    }

    try {
      setError(null);

      // Only show loading on initial load or user change
      if (isInitialLoadRef.current || hasUserChanged) {
        setLoading(true);
      }

      const data =
        userType === "user"
          ? await getUserConversations()
          : await getProviderConversations();

      setConversations(data);
      lastFetchRef.current = now;
      userIdRef.current = user.id;
      isInitialLoadRef.current = false;
    } catch (err) {
      setError("Failed to load conversations");
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [userType, user?.id]);

  // Get total unread count
  const totalUnreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  // Get conversation by service request ID
  const getConversationById = useCallback(
    (serviceRequestId: string) => {
      return conversations.find(
        conv => conv.serviceRequestId === serviceRequestId
      );
    },
    [conversations]
  );

  // Get conversations by status
  const getConversationsByStatus = useCallback(
    (status: string) => {
      return conversations.filter(conv => conv.status === status);
    },
    [conversations]
  );

  // Manual refetch
  const refetch = useCallback(async () => {
    // Reset the debounce to allow immediate refetch
    lastFetchRef.current = 0;
    await fetchConversations();
  }, [fetchConversations]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-refresh functionality with proper cleanup
  useEffect(() => {
    if (!autoRefresh || !user) return;

    const interval = setInterval(() => {
      fetchConversations();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, user, fetchConversations]);

  return {
    conversations,
    loading,
    error,
    totalUnreadCount,
    refetch,
    getConversationById,
    getConversationsByStatus,
    hasConversations: conversations.length > 0,
    hasUnreadMessages: totalUnreadCount > 0,
  };
}
