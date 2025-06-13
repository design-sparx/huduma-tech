import { supabase } from "@/lib/supabase";

import type { ServiceCategory } from "@/types";

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
      // console.error("Error fetching service providers:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    // console.error("Error in getServiceProviders:", error);
    throw error;
  }
}

export async function getServiceProviderById(id: string) {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // console.error("Error fetching service provider:", error);
      if (error.code === "PGRST116") {
        throw new Error("Service provider not found");
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  } catch (error) {
    // console.error("Error in getServiceProviderById:", error);
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
      // console.error("Error fetching provider stats:", error);
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
    return {
      totalProviders: 0,
      totalJobs: 0,
      averageRating: 0,
      topLocations: [],
      topServices: [],
    };
    throw new Error(`Error in getProviderStats: ${error}`);
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
      // console.error("Error searching providers by service:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    // console.error("Error in searchProvidersByService:", error);
    return [];
    throw new Error(`Error in getProviderStats: ${error}`);
  }
}
