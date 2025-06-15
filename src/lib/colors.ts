import type { ServiceRequest } from "@/types";

export function getStatusColor(status: ServiceRequest["status"]): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "accepted":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "in_progress":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getUrgencyColor(urgency: ServiceRequest["urgency"]): string {
  switch (urgency) {
    case "low":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "medium":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "emergency":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getPriorityColor(
  priority: "low" | "medium" | "high" | "urgent"
): string {
  switch (priority) {
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
