import { useEffect,useState } from "react";

import { getUserServiceRequests } from "@/lib/services/requests";

import { useAuth } from "./useAuth";

import type { ServiceRequest } from "@/types";

export function useServiceRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getUserServiceRequests(user.id);
        setRequests(data);
      } catch (err) {
        setError("Failed to fetch service requests");
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const refetch = async () => {
    if (user) {
      try {
        setError(null);
        const data = await getUserServiceRequests(user.id);
        setRequests(data);
      } catch (err) {
        setError("Failed to fetch service requests");
        console.error("Error fetching requests:", err);
      }
    }
  };

  return { requests, loading, error, refetch };
}
