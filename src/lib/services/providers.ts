import { supabase } from "@/lib/supabase";

import type { ServiceCategory, ServiceProvider } from "@/types";

interface ServiceProviderFilters {
  category?: ServiceCategory;
  location?: string;
  searchTerm?: string;
  minRating?: number;
  maxRate?: number;
  sortBy?: "rating" | "hourly_rate" | "total_jobs" | "name";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function getServiceProviders(filters?: ServiceProviderFilters) {
  try {
    let query = supabase
      .from("service_providers")
      .select("*")
      .eq("verified", true);

    // Apply category filter
    if (filters?.category) {
      query = query.contains("services", [filters.category]);
    }

    // Apply location filter with flexible matching
    if (filters?.location) {
      query = query.or(
        `location.ilike.%${filters.location}%,location.ilike.%${filters.location.split(" ")[0]}%`
      );
    }

    // Apply search term with comprehensive matching
    if (filters?.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      // Search in name, bio, and services array
      query = query.or(
        `name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,services.cs.{${searchTerm}}`
      );
    }

    // Apply rating filter
    if (filters?.minRating) {
      query = query.gte("rating", filters.minRating);
    }

    // Apply rate filter
    if (filters?.maxRate) {
      query = query.lte("hourly_rate", filters.maxRate);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "rating";
    const sortOrder = filters?.sortOrder || "desc";

    // Secondary sort by name for consistent ordering
    if (sortBy === "rating") {
      query = query
        .order("rating", { ascending: sortOrder === "asc" })
        .order("total_jobs", { ascending: false })
        .order("name", { ascending: true });
    } else {
      query = query
        .order(sortBy, { ascending: sortOrder === "asc" })
        .order("name", { ascending: true });
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching service providers:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Transform data to match ServiceProvider interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      services: item.services,
      location: item.location,
      rating: item.rating,
      totalJobs: item.total_jobs,
      verified: item.verified,
      avatar: item.avatar,
      hourlyRate: item.hourly_rate,
      bio: item.bio,
      experienceYears: item.experience_years,
      createdAt: item.created_at ? new Date(item.created_at) : undefined,
      updatedAt: item.updated_at ? new Date(item.updated_at) : undefined,
    })) as ServiceProvider[];
  } catch (error) {
    console.error("Error in getServiceProviders:", error);
    throw error;
  }
}

export async function getServiceProviderById(
  id: string
): Promise<ServiceProvider | null> {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching service provider:", error);
      if (error.code === "PGRST116") {
        throw new Error("Service provider not found");
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) return null;

    // Transform data to match ServiceProvider interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      services: data.services,
      location: data.location,
      rating: data.rating,
      totalJobs: data.total_jobs,
      verified: data.verified,
      avatar: data.avatar,
      hourlyRate: data.hourly_rate,
      bio: data.bio,
      experienceYears: data.experience_years,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    } as ServiceProvider;
  } catch (error) {
    console.error("Error in getServiceProviderById:", error);
    throw error;
  }
}

export async function getServiceProviderByEmail(
  email: string
): Promise<ServiceProvider | null> {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Provider not found
      }
      console.error("Error fetching service provider by email:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) return null;

    // Transform data to match ServiceProvider interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      services: data.services,
      location: data.location,
      rating: data.rating,
      totalJobs: data.total_jobs,
      verified: data.verified,
      avatar: data.avatar,
      hourlyRate: data.hourly_rate,
      bio: data.bio,
      experienceYears: data.experience_years,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    } as ServiceProvider;
  } catch (error) {
    console.error("Error in getServiceProviderByEmail:", error);
    throw error;
  }
}

export async function createServiceProvider(
  provider: Omit<ServiceProvider, "createdAt" | "updatedAt"> // Remove "id" from Omit
) {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .insert([
        {
          id: provider.id, // ← Add this line
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          services: provider.services,
          location: provider.location,
          rating: provider.rating || 0,
          total_jobs: provider.totalJobs || 0,
          verified: provider.verified || false,
          avatar: provider.avatar,
          hourly_rate: provider.hourlyRate,
          bio: provider.bio,
          experience_years: provider.experienceYears || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating service provider:", error);
      throw error;
    }

    // Transform data to match ServiceProvider interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      services: data.services,
      location: data.location,
      rating: data.rating,
      totalJobs: data.total_jobs,
      verified: data.verified,
      avatar: data.avatar,
      hourlyRate: data.hourly_rate,
      bio: data.bio,
      experienceYears: data.experience_years,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    } as ServiceProvider;
  } catch (error) {
    console.error("Error in createServiceProvider:", error);
    throw error;
  }
}

export async function updateServiceProvider(
  id: string,
  updates: Partial<Omit<ServiceProvider, "id" | "createdAt" | "updatedAt">>
) {
  try {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.services !== undefined) updateData.services = updates.services;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.totalJobs !== undefined)
      updateData.total_jobs = updates.totalJobs;
    if (updates.verified !== undefined) updateData.verified = updates.verified;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    if (updates.hourlyRate !== undefined)
      updateData.hourly_rate = updates.hourlyRate;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.experienceYears !== undefined)
      updateData.experience_years = updates.experienceYears;

    const { data, error } = await supabase
      .from("service_providers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating service provider:", error);
      throw error;
    }

    // Transform data to match ServiceProvider interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      services: data.services,
      location: data.location,
      rating: data.rating,
      totalJobs: data.total_jobs,
      verified: data.verified,
      avatar: data.avatar,
      hourlyRate: data.hourly_rate,
      bio: data.bio,
      experienceYears: data.experience_years,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    } as ServiceProvider;
  } catch (error) {
    console.error("Error in updateServiceProvider:", error);
    throw error;
  }
}

export async function deleteServiceProvider(id: string) {
  try {
    const { error } = await supabase
      .from("service_providers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting service provider:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteServiceProvider:", error);
    throw error;
  }
}

export async function getProviderStats() {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .select("rating, total_jobs, location, services")
      .eq("verified", true);

    if (error) {
      console.error("Error fetching provider stats:", error);
      return {
        totalProviders: 0,
        totalJobs: 0,
        averageRating: 0,
        topLocations: [],
        topServices: [],
      };
    }

    const providers = data || [];
    const totalProviders = providers.length;
    const totalJobs = providers.reduce((sum, p) => sum + p.total_jobs, 0);
    const averageRating =
      totalProviders > 0
        ? providers.reduce((sum, p) => sum + p.rating, 0) / totalProviders
        : 0;

    // Get top locations
    const locationCounts = providers.reduce(
      (acc, p) => {
        acc[p.location] = (acc[p.location] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    // Get top services
    const serviceCounts = providers.reduce(
      (acc, p) => {
        p.services.forEach((service: any) => {
          acc[service] = (acc[service] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    const topServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([service, count]) => ({ service, count }));

    return {
      totalProviders,
      totalJobs,
      averageRating: Math.round(averageRating * 10) / 10,
      topLocations,
      topServices,
    };
  } catch (error) {
    console.error("Error in getProviderStats:", error);
    return {
      totalProviders: 0,
      totalJobs: 0,
      averageRating: 0,
      topLocations: [],
      topServices: [],
    };
  }
}

export async function searchProvidersByService(service: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .select("id, name, rating, location, hourly_rate")
      .eq("verified", true)
      .contains("services", [service])
      .order("rating", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error searching providers by service:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in searchProvidersByService:", error);
    return [];
  }
}

// Provider analytics functions
export async function getProviderPerformanceStats(providerId: string) {
  try {
    // Get provider's request stats
    const { data: requestStats, error: requestError } = await supabase
      .from("service_requests")
      .select("status, budget, created_at, completed_at")
      .eq("provider_id", providerId);

    if (requestError) {
      console.error("Error fetching provider request stats:", requestError);
      return null;
    }

    const requests = requestStats || [];
    const totalRequests = requests.length;
    const completedRequests = requests.filter(
      r => r.status === "completed"
    ).length;
    const activeRequests = requests.filter(
      r => r.status === "accepted" || r.status === "in_progress"
    ).length;
    const totalEarnings = requests
      .filter(r => r.status === "completed")
      .reduce((sum, r) => sum + r.budget, 0);

    // Calculate completion rate
    const completionRate =
      totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    // Calculate average completion time (in days)
    const completedWithTimes = requests.filter(
      r => r.status === "completed" && r.completed_at && r.created_at
    );

    const averageCompletionTime =
      completedWithTimes.length > 0
        ? completedWithTimes.reduce((sum, r) => {
            const start = new Date(r.created_at).getTime();
            const end = new Date(r.completed_at).getTime();
            return sum + (end - start) / (1000 * 60 * 60 * 24); // Convert to days
          }, 0) / completedWithTimes.length
        : 0;

    return {
      totalRequests,
      completedRequests,
      activeRequests,
      totalEarnings,
      completionRate: Math.round(completionRate * 10) / 10,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
    };
  } catch (error) {
    console.error("Error in getProviderPerformanceStats:", error);
    return null;
  }
}

// Update provider rating after a completed job
export async function updateProviderRating(providerId: string) {
  try {
    // Get all reviews for this provider
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("provider_id", providerId);

    if (reviewError) {
      console.error("Error fetching provider reviews:", reviewError);
      return false;
    }

    const reviewList = reviews || [];

    if (reviewList.length === 0) {
      return true; // No reviews yet, keep current rating
    }

    // Calculate new average rating
    const averageRating =
      reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length;
    const roundedRating = Math.round(averageRating * 10) / 10;

    // Update provider's rating
    const { error: updateError } = await supabase
      .from("service_providers")
      .update({
        rating: roundedRating,
        total_jobs: reviewList.length,
      })
      .eq("id", providerId);

    if (updateError) {
      console.error("Error updating provider rating:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateProviderRating:", error);
    return false;
  }
}
