"use client";

import { useEffect } from "react";

import { ArrowRight, CheckCircle2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/constants";
import { formatPrice } from "@/lib/formats";

interface RequestSuccessProps {
  request: {
    id: string;
    title: string;
    category: string;
    location: string;
    budget: number;
    urgency: string;
  };
  onViewRequest: () => void;
  onCreateAnother: () => void;
}

export function RequestSuccess({
  request,
  onViewRequest,
  onCreateAnother,
}: RequestSuccessProps) {
  useEffect(() => {
    // Auto-scroll to success message
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const categoryInfo = SERVICE_CATEGORIES.find(
    cat => cat.value === request.category
  );
  const Icon = categoryInfo?.icon;

  // Method 1: Using a helper function (recommended - matches your existing pattern)
  const getUrgencyStyles = (urgency: string) => {
    const urgencyStyles = {
      emergency: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return (
      urgencyStyles[urgency as keyof typeof urgencyStyles] || urgencyStyles.low
    );
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Request Created Successfully!
        </h2>
        <p className="mt-2 text-gray-600">
          Your service request has been submitted and providers will be
          notified.
        </p>
      </div>

      {/* Request Summary */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">Request Summary</h3>

        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-500">Service</span>
            <div className="text-right">
              <div className="font-medium">{request.title}</div>
              <div className="flex items-center justify-end gap-1 text-sm text-gray-500">
                {Icon && <Icon className="h-4 w-4" />}
                {categoryInfo?.label}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Location</span>
            <span className="font-medium">{request.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Budget</span>
            <span className="font-semibold text-green-600">
              {formatPrice(request.budget)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Urgency</span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getUrgencyStyles(request.urgency)}`}
            >
              {request.urgency.charAt(0).toUpperCase() +
                request.urgency.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="rounded-lg bg-blue-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-blue-900">
          What happens next?
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
            <span>Service providers in your area will be notified</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
            <span>
              You&apos;ll receive quotes and can choose the best provider
            </span>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
            <span>Track your request status in &quot;My Requests&quot;</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onViewRequest} className="flex-1">
          <ArrowRight className="mr-2 h-4 w-4" />
          View My Requests
        </Button>
        <Button onClick={onCreateAnother} variant="outline" className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          Create Another Request
        </Button>
      </div>
    </div>
  );
}
