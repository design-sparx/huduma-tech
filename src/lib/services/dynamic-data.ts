import { supabase } from "@/lib/supabase";

// Types for the new dynamic data
export interface ServiceCategory {
  id: string;
  value: string;
  label: string;
  description?: string;
  icon: string;
  colorClass: string;
  isActive: boolean;
  sortOrder: number;
  rateMin: number;
  rateTypical: number;
  rateMax: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceLocation {
  id: string;
  name: string;
  region?: string;
  county?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Service Categories Functions
export async function getActiveServiceCategories(): Promise<ServiceCategory[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    console.error("Error fetching service categories:", error);
    throw new Error("Failed to fetch service categories");
  }

  return data.map(transformServiceCategory);
}

export async function getServiceCategoryById(
  id: string
): Promise<ServiceCategory | null> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching service category:", error);
    throw new Error("Failed to fetch service category");
  }

  return transformServiceCategory(data);
}

export async function getServiceCategoryByValue(
  value: string
): Promise<ServiceCategory | null> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("value", value)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching service category:", error);
    throw new Error("Failed to fetch service category");
  }

  return transformServiceCategory(data);
}

// Admin functions for managing categories
export async function createServiceCategory(
  categoryData: Omit<ServiceCategory, "id" | "createdAt" | "updatedAt">
): Promise<ServiceCategory> {
  const { data, error } = await supabase
    .from("service_categories")
    .insert([
      {
        value: categoryData.value,
        label: categoryData.label,
        description: categoryData.description,
        icon: categoryData.icon,
        color_class: categoryData.colorClass,
        is_active: categoryData.isActive,
        sort_order: categoryData.sortOrder,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating service category:", error);
    throw new Error("Failed to create service category");
  }

  return transformServiceCategory(data);
}

export async function updateServiceCategory(
  id: string,
  updates: Partial<ServiceCategory>
): Promise<ServiceCategory> {
  const updateData: any = {};

  if (updates.value !== undefined) updateData.value = updates.value;
  if (updates.label !== undefined) updateData.label = updates.label;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.colorClass !== undefined)
    updateData.color_class = updates.colorClass;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.sortOrder !== undefined)
    updateData.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from("service_categories")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating service category:", error);
    throw new Error("Failed to update service category");
  }

  return transformServiceCategory(data);
}

export async function deleteServiceCategory(id: string): Promise<void> {
  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from("service_categories")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Error deleting service category:", error);
    throw new Error("Failed to delete service category");
  }
}

// Service Locations Functions
export async function getActiveServiceLocations(): Promise<ServiceLocation[]> {
  const { data, error } = await supabase
    .from("service_locations")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching service locations:", error);
    throw new Error("Failed to fetch service locations");
  }

  return data.map(transformServiceLocation);
}

export async function getServiceLocationsByRegion(
  region: string
): Promise<ServiceLocation[]> {
  const { data, error } = await supabase
    .from("service_locations")
    .select("*")
    .eq("region", region)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching service locations:", error);
    throw new Error("Failed to fetch service locations");
  }

  return data.map(transformServiceLocation);
}

export async function getServiceLocationById(
  id: string
): Promise<ServiceLocation | null> {
  const { data, error } = await supabase
    .from("service_locations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching service location:", error);
    throw new Error("Failed to fetch service location");
  }

  return transformServiceLocation(data);
}

// Admin functions for managing locations
export async function createServiceLocation(
  locationData: Omit<ServiceLocation, "id" | "createdAt" | "updatedAt">
): Promise<ServiceLocation> {
  const { data, error } = await supabase
    .from("service_locations")
    .insert([
      {
        name: locationData.name,
        region: locationData.region,
        county: locationData.county,
        is_active: locationData.isActive,
        sort_order: locationData.sortOrder,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating service location:", error);
    throw new Error("Failed to create service location");
  }

  return transformServiceLocation(data);
}

export async function updateServiceLocation(
  id: string,
  updates: Partial<ServiceLocation>
): Promise<ServiceLocation> {
  const updateData: any = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.region !== undefined) updateData.region = updates.region;
  if (updates.county !== undefined) updateData.county = updates.county;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.sortOrder !== undefined)
    updateData.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from("service_locations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating service location:", error);
    throw new Error("Failed to update service location");
  }

  return transformServiceLocation(data);
}

export async function deleteServiceLocation(id: string): Promise<void> {
  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from("service_locations")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Error deleting service location:", error);
    throw new Error("Failed to delete service location");
  }
}

// System Settings Functions
export async function getSystemSettings(
  category?: string
): Promise<SystemSetting[]> {
  let query = supabase
    .from("system_settings")
    .select("*")
    .eq("is_active", true);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query.order("key", { ascending: true });

  if (error) {
    console.error("Error fetching system settings:", error);
    throw new Error("Failed to fetch system settings");
  }

  return data.map(transformSystemSetting);
}

export async function getSystemSetting(
  key: string
): Promise<SystemSetting | null> {
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .eq("key", key)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching system setting:", error);
    throw new Error("Failed to fetch system setting");
  }

  return transformSystemSetting(data);
}

export async function getSystemSettingValue(key: string): Promise<any> {
  const setting = await getSystemSetting(key);
  return setting?.value;
}

// Admin functions for managing settings
export async function createSystemSetting(
  settingData: Omit<SystemSetting, "id" | "createdAt" | "updatedAt">
): Promise<SystemSetting> {
  const { data, error } = await supabase
    .from("system_settings")
    .insert([
      {
        key: settingData.key,
        value: settingData.value,
        description: settingData.description,
        category: settingData.category,
        is_active: settingData.isActive,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating system setting:", error);
    throw new Error("Failed to create system setting");
  }

  return transformSystemSetting(data);
}

export async function updateSystemSetting(
  key: string,
  updates: Partial<SystemSetting>
): Promise<SystemSetting> {
  const updateData: any = {};

  if (updates.value !== undefined) updateData.value = updates.value;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from("system_settings")
    .update(updateData)
    .eq("key", key)
    .select()
    .single();

  if (error) {
    console.error("Error updating system setting:", error);
    throw new Error("Failed to update system setting");
  }

  return transformSystemSetting(data);
}

export async function deleteSystemSetting(key: string): Promise<void> {
  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from("system_settings")
    .update({ is_active: false })
    .eq("key", key);

  if (error) {
    console.error("Error deleting system setting:", error);
    throw new Error("Failed to delete system setting");
  }
}

// Transform functions to convert database format to application format
function transformServiceCategory(data: any): ServiceCategory {
  return {
    id: data.id,
    value: data.value,
    label: data.label,
    description: data.description,
    icon: data.icon,
    colorClass: data.color_class,
    isActive: data.is_active,
    sortOrder: data.sort_order,
    // Add rate suggestions
    rateMin: data.rate_min || 500,
    rateTypical: data.rate_typical || 1000,
    rateMax: data.rate_max || 2000,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

function transformServiceLocation(data: any): ServiceLocation {
  return {
    id: data.id,
    name: data.name,
    region: data.region,
    county: data.county,
    isActive: data.is_active,
    sortOrder: data.sort_order,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

function transformSystemSetting(data: any): SystemSetting {
  return {
    id: data.id,
    key: data.key,
    value: data.value,
    description: data.description,
    category: data.category,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Cache functions for better performance
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Cached versions of commonly used functions
export async function getCachedServiceCategories(): Promise<ServiceCategory[]> {
  const cached = getCachedData("service_categories");
  if (cached) return cached;

  const categories = await getActiveServiceCategories();
  setCachedData("service_categories", categories);
  return categories;
}

export async function getCachedServiceLocations(): Promise<ServiceLocation[]> {
  const cached = getCachedData("service_locations");
  if (cached) return cached;

  const locations = await getActiveServiceLocations();
  setCachedData("service_locations", locations);
  return locations;
}

// Helper functions for backward compatibility
export async function getServiceCategoriesAsConstants() {
  const categories = await getCachedServiceCategories();
  return categories.map(cat => ({
    value: cat.value,
    label: cat.label,
    icon: cat.icon, // You'll need to map this to actual icon components
    color: cat.colorClass,
  }));
}

export async function getServiceLocationsAsArray(): Promise<string[]> {
  const locations = await getCachedServiceLocations();
  return locations.map(loc => loc.name);
}

// Add function to get rate suggestions for multiple categories
export async function getRateSuggestionsForCategories(
  categoryValues: string[]
): Promise<Record<string, { min: number; typical: number; max: number }>> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("value, rate_min, rate_typical, rate_max")
    .in("value", categoryValues)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching rate suggestions:", error);
    return {};
  }

  return data.reduce(
    (acc, category) => {
      acc[category.value] = {
        min: category.rate_min,
        typical: category.rate_typical,
        max: category.rate_max,
      };
      return acc;
    },
    {} as Record<string, { min: number; typical: number; max: number }>
  );
}

// Add function to calculate suggested rate for multiple categories
export async function calculateSuggestedRate(
  categoryValues: string[]
): Promise<number> {
  const suggestions = await getRateSuggestionsForCategories(categoryValues);

  if (Object.keys(suggestions).length === 0) {
    return 1000; // Default fallback
  }

  const totalTypical = Object.values(suggestions).reduce(
    (sum, suggestion) => sum + suggestion.typical,
    0
  );

  return Math.round(totalTypical / Object.keys(suggestions).length);
}
