// src/hooks/useDynamicData.ts - React hooks for managing dynamic categories, locations, and settings

import { useCallback, useEffect, useState } from "react";

import {
  calculateSuggestedRate,
  getActiveServiceCategories,
  getActiveServiceLocations,
  getRateSuggestionsForCategories,
  getSystemSetting,
  getSystemSettings,
  type ServiceCategory,
  type ServiceLocation,
  type SystemSetting,
} from "@/lib/services/dynamic-data";

// Hook for service categories
export function useServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveServiceCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

// Hook for service locations
export function useServiceLocations() {
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveServiceLocations();
      setLocations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch locations"
      );
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
  };
}

// Hook for system settings
export function useSystemSettings(category?: string) {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSystemSettings(category);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
}

// Hook for a single system setting
export function useSystemSetting(key: string) {
  const [setting, setSetting] = useState<SystemSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSetting = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSystemSetting(key);
      setSetting(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch setting");
      console.error("Error fetching setting:", err);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    fetchSetting();
  }, [fetchSetting]);

  return {
    setting,
    value: setting?.value,
    loading,
    error,
    refetch: fetchSetting,
  };
}

// Combined hook for forms that need both categories and locations
export function useFormData() {
  const categoriesHook = useServiceCategories();
  const locationsHook = useServiceLocations();

  const loading = categoriesHook.loading || locationsHook.loading;
  const error = categoriesHook.error || locationsHook.error;

  const refetch = () => {
    categoriesHook.refetch();
    locationsHook.refetch();
  };

  return {
    categories: categoriesHook.categories,
    locations: locationsHook.locations,
    loading,
    error,
    refetch,
  };
}

// Hook for budget limits from system settings
export function useBudgetLimits() {
  const { setting, loading, error } = useSystemSetting("budget_limits");

  const budgetLimits = setting?.value || { min: 100, max: 1000000 };

  return {
    minBudget: budgetLimits.min,
    maxBudget: budgetLimits.max,
    loading,
    error,
  };
}

// Hook for platform configuration
export function usePlatformConfig() {
  const { settings, loading, error } = useSystemSettings("features");

  const config = settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {} as Record<string, any>
  );

  return {
    config,
    loading,
    error,
    // Common config values with defaults
    isVerificationRequired: config.provider_verification_required ?? true,
    isReviewRequired: config.review_required_for_completion ?? true,
    autoExpireDays: config.request_auto_expire_days ?? 30,
    maxCategoriesPerProvider: config.max_service_categories_per_provider ?? 5,
  };
}

// Hook for backward compatibility with existing constants
export function useServiceConstants() {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useServiceCategories();
  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
  } = useServiceLocations();

  const loading = categoriesLoading || locationsLoading;
  const error = categoriesError || locationsError;

  // Transform to match the old SERVICE_CATEGORIES format
  const serviceCategories = categories.map(cat => ({
    value: cat.value,
    label: cat.label,
    icon: cat.icon, // This will need to be mapped to actual Lucide icons
    color: cat.colorClass,
  }));

  // Transform to match the old KENYAN_LOCATIONS format
  const kenyanLocations = locations.map(loc => loc.name);

  return {
    SERVICE_CATEGORIES: serviceCategories,
    KENYAN_LOCATIONS: kenyanLocations,
    loading,
    error,
  };
}

export function useRateSuggestions(serviceCategories: string[]) {
  const [suggestions, setSuggestions] = useState<
    Record<string, { min: number; typical: number; max: number }>
  >({});
  const [suggestedRate, setSuggestedRate] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (serviceCategories.length === 0) {
      setSuggestions({});
      setSuggestedRate(1000);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [rateSuggestions, calculatedRate] = await Promise.all([
        getRateSuggestionsForCategories(serviceCategories),
        calculateSuggestedRate(serviceCategories),
      ]);

      setSuggestions(rateSuggestions);
      setSuggestedRate(calculatedRate);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch rate suggestions"
      );
      console.error("Error fetching rate suggestions:", err);
    } finally {
      setLoading(false);
    }
  }, [serviceCategories]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]); // Dependency on stringified array

  return {
    suggestions,
    suggestedRate,
    loading,
    error,
    refetch: fetchSuggestions,
  };
}
