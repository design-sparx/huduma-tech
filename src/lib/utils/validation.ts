export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ServiceRequestData {
  title: string;
  description: string;
  category: string;
  location: string;
  urgency: string;
  budget: number;
}

export function validateServiceRequest(
  data: ServiceRequestData
): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title.trim()) {
    errors.title = "Service title is required";
  } else if (data.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters long";
  } else if (data.title.trim().length > 100) {
    errors.title = "Title must be less than 100 characters";
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = "Description is required";
  } else if (data.description.trim().length < 20) {
    errors.description = "Please provide more details (at least 20 characters)";
  } else if (data.description.trim().length > 1000) {
    errors.description = "Description must be less than 1000 characters";
  }

  // Category validation
  if (!data.category) {
    errors.category = "Please select a service category";
  }

  // Location validation
  if (!data.location) {
    errors.location = "Please select your location";
  }

  // Budget validation
  if (!data.budget || data.budget <= 0) {
    errors.budget = "Please enter a valid budget amount";
  } else if (data.budget < 100) {
    errors.budget = "Minimum budget is KES 100";
  } else if (data.budget > 1000000) {
    errors.budget = "Maximum budget is KES 1,000,000";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateField(
  field: string,
  value: any,
  data: ServiceRequestData
): string | null {
  const validation = validateServiceRequest(data);
  return validation.errors[field] || null;
}

// Budget suggestions based on category
export const BUDGET_SUGGESTIONS = {
  electrical: { min: 500, typical: 2000, max: 10000 },
  plumbing: { min: 800, typical: 3000, max: 15000 },
  automotive: { min: 1000, typical: 5000, max: 50000 },
  hvac: { min: 1500, typical: 8000, max: 30000 },
  carpentry: { min: 1000, typical: 5000, max: 25000 },
  painting: { min: 500, typical: 3000, max: 20000 },
  general_maintenance: { min: 300, typical: 1500, max: 8000 },
};

export function getBudgetSuggestion(category: string) {
  return (
    BUDGET_SUGGESTIONS[category as keyof typeof BUDGET_SUGGESTIONS] || {
      min: 500,
      typical: 2000,
      max: 10000,
    }
  );
}
