"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Calendar, Clock, DollarSign, MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui";
import { SERVICE_CATEGORIES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { getStatusColor, getUrgencyColor } from "@/lib/colors";
import { formatPrice } from "@/lib/formats";

export default function MyRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    requests: serviceRequests,
    loading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useServiceRequests();

  // Redirect if not authenticated
  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Service Requests</h2>
        <Button asChild>
          <Link href="/request">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Loading State */}
      {requestsLoading && (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      )}

      {/* Error State */}
      {requestsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">{requestsError}</p>
          <Button variant="outline" onClick={refetchRequests} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!requestsLoading && !requestsError && serviceRequests.length === 0 && (
        <div className="rounded-lg bg-white py-12 text-center shadow-md">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No service requests yet
          </h3>
          <p className="mb-4 text-gray-600">
            Create your first service request to get started
          </p>
          <Button asChild>
            <Link href="/request">Create Request</Link>
          </Button>
        </div>
      )}

      {/* Requests List */}
      {!requestsLoading && !requestsError && serviceRequests.length > 0 && (
        <div className="space-y-4">
          {serviceRequests.map(request => (
            <div key={request.id} className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold">
                    {request.title}
                  </h3>
                  <p className="mb-3 text-gray-600">{request.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{request.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatPrice(request.budget)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getUrgencyColor(
                      request.urgency
                    )}`}
                  >
                    {request.urgency.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {SERVICE_CATEGORIES.map(category => {
                    if (category.value === request.category) {
                      const Icon = category.icon;
                      return (
                        <span
                          key={category.value}
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${category.color}`}
                        >
                          <Icon className="mr-1 h-3 w-3" />
                          {category.label}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {request.status === "pending" && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
