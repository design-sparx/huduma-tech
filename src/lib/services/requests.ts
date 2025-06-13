import { supabase } from "@/lib/supabase";

import type { ServiceCategory, ServiceRequest } from "@/types";

export async function createServiceRequest(
  request: Omit<ServiceRequest, "id" | "createdAt">
) {
  try {
    const { data, error } = await supabase
      .from("service_requests")
      .insert([
        {
          user_id: request.userId,
          title: request.title,
          description: request.description,
          category: request.category,
          location: request.location,
          urgency: request.urgency,
          status: request.status,
          budget: request.budget,
          scheduled_date: request.scheduledDate,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating service request:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createServiceRequest:", error);
    throw error;
  }
}

export async function getUserServiceRequests(userId: string) {
  try {
    const { data, error } = await supabase
      .from("service_requests")
      .select(
        `
        *,
        service_providers (
          name,
          phone,
          email,
          rating
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user service requests:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserServiceRequests:", error);
    return [];
  }
}

export async function updateServiceRequestStatus(
  requestId: string,
  status: ServiceRequest["status"],
  providerId?: string
) {
  try {
    const updateData: any = { status };
    if (providerId) {
      updateData.provider_id = providerId;
    }
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("service_requests")
      .update(updateData)
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      console.error("Error updating service request:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateServiceRequestStatus:", error);
    throw error;
  }
}

export async function getAvailableRequests(category?: ServiceCategory) {
  try {
    let query = supabase
      .from("service_requests")
      .select(
        `
        *,
        users (
          name,
          phone,
          location
        )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching available requests:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAvailableRequests:", error);
    return [];
  }
}
