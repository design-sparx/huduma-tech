export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  location: string;
  rating: number;
  totalJobs: number;
  verified: boolean;
  avatar?: string;
  hourlyRate: number;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  providerId?: string;
  title: string;
  description: string;
  category: ServiceCategory;
  location: string;
  urgency: "low" | "medium" | "high" | "emergency";
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  budget: number;
  createdAt: Date;
  scheduledDate?: Date;
  completedAt?: Date;
}

export type ServiceCategory =
  | "electrical"
  | "plumbing"
  | "automotive"
  | "hvac"
  | "carpentry"
  | "painting"
  | "general_maintenance";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
}
