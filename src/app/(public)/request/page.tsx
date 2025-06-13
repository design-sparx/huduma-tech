"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { KENYAN_LOCATIONS, SERVICE_CATEGORIES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { createServiceRequest } from "@/lib/services/requests";

import type { ServiceCategory } from "@/types";

export default function RequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "" as ServiceCategory | "",
    location: "",
    urgency: "medium" as "low" | "medium" | "high" | "emergency",
    budget: 0,
  });

  // Redirect if not authenticated
  if (!user) {
    router.push("/");
    return null;
  }

  const handleCreateRequest = async () => {
    if (
      !newRequest.title ||
      !newRequest.description ||
      !newRequest.category ||
      !newRequest.location ||
      !newRequest.budget
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsCreatingRequest(true);
    setError(null);

    try {
      await createServiceRequest({
        userId: user.id,
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        location: newRequest.location,
        urgency: newRequest.urgency,
        status: "pending",
        budget: newRequest.budget,
      });

      // Reset form and redirect
      setNewRequest({
        title: "",
        description: "",
        category: "",
        location: "",
        urgency: "medium",
        budget: 0,
      });

      router.push("/my-requests");
    } catch (err: any) {
      setError(err.message || "Failed to create request");
    } finally {
      setIsCreatingRequest(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Request a Service</h2>

      <div className="space-y-6 rounded-lg bg-white p-6 shadow-md">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Service Title *
          </label>
          <Input
            placeholder="e.g., Fix kitchen sink leak"
            value={newRequest.title}
            onChange={e =>
              setNewRequest({ ...newRequest, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description *
          </label>
          <Textarea
            placeholder="Describe your issue in detail..."
            value={newRequest.description}
            onChange={e =>
              setNewRequest({
                ...newRequest,
                description: e.target.value,
              })
            }
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category *
            </label>
            <Select
              value={newRequest.category}
              onValueChange={value =>
                setNewRequest({
                  ...newRequest,
                  category: value as ServiceCategory,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Location *
            </label>
            <Select
              value={newRequest.location}
              onValueChange={value =>
                setNewRequest({ ...newRequest, location: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {KENYAN_LOCATIONS.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Urgency
            </label>
            <Select
              value={newRequest.urgency}
              onValueChange={value =>
                setNewRequest({
                  ...newRequest,
                  urgency: value as "medium" | "low" | "high" | "emergency",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Within a week</SelectItem>
                <SelectItem value="medium">Medium - Within 2-3 days</SelectItem>
                <SelectItem value="high">High - Within 24 hours</SelectItem>
                <SelectItem value="emergency">Emergency - ASAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Budget (KES) *
            </label>
            <Input
              type="number"
              placeholder="Enter your budget"
              value={newRequest.budget || ""}
              onChange={e =>
                setNewRequest({
                  ...newRequest,
                  budget: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <Button
          onClick={handleCreateRequest}
          className="w-full"
          size="lg"
          disabled={isCreatingRequest}
        >
          <Plus className="mr-2 h-4 w-4" />
          {isCreatingRequest ? "Creating..." : "Create Service Request"}
        </Button>
      </div>
    </div>
  );
}
