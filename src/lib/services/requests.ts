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
      // console.error("Error creating service request:", error);
      throw error;
    }

    return data;
  } catch (error) {
    // console.error("Error in createServiceRequest:", error);
    throw error;
  }
}

export async function getUserServiceRequests(
  userId: string
): Promise<ServiceRequest[]> {
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
          rating,
          verified
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      // console.error("Error fetching user service requests:", error);
      return [];
    }

    // Transform the data to match our ServiceRequest interface
    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      providerId: item.provider_id,
      title: item.title,
      description: item.description,
      category: item.category as ServiceCategory,
      location: item.location,
      urgency: item.urgency as ServiceRequest["urgency"],
      status: item.status as ServiceRequest["status"],
      budget: item.budget,
      createdAt: new Date(item.created_at),
      scheduledDate: item.scheduled_date
        ? new Date(item.scheduled_date)
        : undefined,
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      provider: item.service_providers
        ? {
            name: item.service_providers.name,
            phone: item.service_providers.phone,
            email: item.service_providers.email,
            rating: item.service_providers.rating,
            verified: item.service_providers.verified,
          }
        : undefined,
    }));
  } catch (error) {
    // return [];
    throw new Error(`Error in getUserServiceRequests: ${error}`);
  }
}

export async function updateServiceRequest(
  requestId: string,
  updates: Partial<Omit<ServiceRequest, "id" | "userId" | "createdAt">>
) {
  try {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.urgency !== undefined) updateData.urgency = updates.urgency;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.budget !== undefined) updateData.budget = updates.budget;
    if (updates.providerId !== undefined)
      updateData.provider_id = updates.providerId;
    if (updates.scheduledDate !== undefined)
      updateData.scheduled_date = updates.scheduledDate?.toISOString();
    if (updates.completedAt !== undefined)
      updateData.completed_at = updates.completedAt?.toISOString();

    // Auto-set completed_at when status changes to completed
    if (updates.status === "completed" && !updates.completedAt) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("service_requests")
      .update(updateData)
      .eq("id", requestId)
      .select(
        `
        *,
        service_providers (
          name,
          phone,
          email,
          rating,
          verified
        )
      `
      )
      .single();

    if (error) {
      // console.error("Error updating service request:", error);
      throw new Error(`Error updating service request:: ${error}`);
    }

    // Transform the response to match our ServiceRequest interface
    return {
      id: data.id,
      userId: data.user_id,
      providerId: data.provider_id,
      title: data.title,
      description: data.description,
      category: data.category as ServiceCategory,
      location: data.location,
      urgency: data.urgency as ServiceRequest["urgency"],
      status: data.status as ServiceRequest["status"],
      budget: data.budget,
      createdAt: new Date(data.created_at),
      scheduledDate: data.scheduled_date
        ? new Date(data.scheduled_date)
        : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      provider: data.service_providers
        ? {
            name: data.service_providers.name,
            phone: data.service_providers.phone,
            email: data.service_providers.email,
            rating: data.service_providers.rating,
            verified: data.service_providers.verified,
          }
        : undefined,
    } as ServiceRequest;
  } catch (error) {
    // console.error("Error in updateServiceRequest:", error);
    throw error;
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
      // console.error("Error updating service request:", error);
      throw error;
    }

    return data;
  } catch (error) {
    // console.error("Error in updateServiceRequestStatus:", error);
    throw error;
  }
}

export async function deleteServiceRequest(requestId: string) {
  try {
    const { error } = await supabase
      .from("service_requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      // console.error("Error deleting service request:", error);
      throw error;
    }

    return true;
  } catch (error) {
    // console.error("Error in deleteServiceRequest:", error);
    throw error;
  }
}

export async function getServiceRequestById(
  requestId: string
): Promise<ServiceRequest | null> {
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
          rating,
          verified
        ),
        users (
          name,
          phone,
          email
        )
      `
      )
      .eq("id", requestId)
      .single();

    if (error) {
      // console.error("Error fetching service request:", error);
      return null;
    }

    if (!data) return null;

    // Transform the data to match our ServiceRequest interface
    return {
      id: data.id,
      userId: data.user_id,
      providerId: data.provider_id,
      title: data.title,
      description: data.description,
      category: data.category as ServiceCategory,
      location: data.location,
      urgency: data.urgency as ServiceRequest["urgency"],
      status: data.status as ServiceRequest["status"],
      budget: data.budget,
      createdAt: new Date(data.created_at),
      scheduledDate: data.scheduled_date
        ? new Date(data.scheduled_date)
        : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      provider: data.service_providers
        ? {
            name: data.service_providers.name,
            phone: data.service_providers.phone,
            email: data.service_providers.email,
            rating: data.service_providers.rating,
            verified: data.service_providers.verified,
          }
        : undefined,
    };
  } catch (error) {
    // console.error("Error in getServiceRequestById:", error);
    // return null;
    throw error;
  }
}

export async function getAvailableRequests(
  category?: ServiceCategory
): Promise<ServiceRequest[]> {
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
      // console.error("Error fetching available requests:", error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      providerId: item.provider_id,
      title: item.title,
      description: item.description,
      category: item.category as ServiceCategory,
      location: item.location,
      urgency: item.urgency as ServiceRequest["urgency"],
      status: item.status as ServiceRequest["status"],
      budget: item.budget,
      createdAt: new Date(item.created_at),
      scheduledDate: item.scheduled_date
        ? new Date(item.scheduled_date)
        : undefined,
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
    }));
  } catch (error) {
    // console.error("Error in getAvailableRequests:", error);
    // return [];
    throw error;
  }
}

// Request Analytics Functions
export async function getRequestStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from("service_requests")
      .select("status, budget, created_at")
      .eq("user_id", userId);

    if (error) {
      // console.error("Error fetching request stats:", error);
      return null;
    }

    const stats = data.reduce(
      (acc, request) => {
        acc.total++;
        acc[request.status as keyof typeof acc]++;

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

    return stats;
  } catch (error) {
    // console.error("Error in getRequestStats:", error);
    // return null;
    throw error;
  }
}

// Batch operations
export async function bulkUpdateRequestStatus(
  requestIds: string[],
  status: ServiceRequest["status"]
) {
  try {
    const updateData: any = { status };
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("service_requests")
      .update(updateData)
      .in("id", requestIds)
      .select();

    if (error) {
      // console.error("Error bulk updating requests:", error);
      throw error;
    }

    return data;
  } catch (error) {
    // console.error("Error in bulkUpdateRequestStatus:", error);
    throw error;
  }
}

// Search and filter requests
export interface RequestFilters {
  userId?: string;
  status?: ServiceRequest["status"][];
  category?: ServiceCategory[];
  urgency?: ServiceRequest["urgency"][];
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export async function searchRequests(
  filters: RequestFilters
): Promise<ServiceRequest[]> {
  try {
    let query = supabase.from("service_requests").select(`
        *,
        service_providers (
          name,
          phone,
          email,
          rating,
          verified
        ),
        users (
          name,
          phone,
          email
        )
      `);

    // Apply filters
    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in("status", filters.status);
    }

    if (filters.category && filters.category.length > 0) {
      query = query.in("category", filters.category);
    }

    if (filters.urgency && filters.urgency.length > 0) {
      query = query.in("urgency", filters.urgency);
    }

    if (filters.minBudget !== undefined) {
      query = query.gte("budget", filters.minBudget);
    }

    if (filters.maxBudget !== undefined) {
      query = query.lte("budget", filters.maxBudget);
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.searchTerm) {
      query = query.or(
        `title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
      );
    }

    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo.toISOString());
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    // Order by created_at desc by default
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      // console.error("Error searching requests:", error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      providerId: item.provider_id,
      title: item.title,
      description: item.description,
      category: item.category as ServiceCategory,
      location: item.location,
      urgency: item.urgency as ServiceRequest["urgency"],
      status: item.status as ServiceRequest["status"],
      budget: item.budget,
      createdAt: new Date(item.created_at),
      scheduledDate: item.scheduled_date
        ? new Date(item.scheduled_date)
        : undefined,
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      provider: item.service_providers
        ? {
            name: item.service_providers.name,
            phone: item.service_providers.phone,
            email: item.service_providers.email,
            rating: item.service_providers.rating,
            verified: item.service_providers.verified,
          }
        : undefined,
    }));
  } catch (error) {
    // console.error("Error in searchRequests:", error);
    // return [];
    throw error;
  }
}
