import { supabase } from "@/lib/supabase";

import type { ServiceCategory } from "@/types";

export async function getServiceProviders(filters?: {
  category?: ServiceCategory;
  location?: string;
  searchTerm?: string;
}) {
  try {
    let query = supabase
      .from("service_providers")
      .select("*")
      .eq("verified", true)
      .order("rating", { ascending: false });

    if (filters?.category) {
      query = query.contains("services", [filters.category]);
    }

    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters?.searchTerm) {
      query = query.or(
        `name.ilike.%${filters.searchTerm}%,bio.ilike.%${filters.searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching service providers:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getServiceProviders:", error);
    return [];
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
      console.error("Error fetching service provider:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getServiceProviderById:", error);
    return null;
  }
}
