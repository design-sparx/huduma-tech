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
  bio?: string;
  experienceYears?: number;
  createdAt?: Date;
  updatedAt?: Date;
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
  provider?: {
    name: string;
    phone: string;
    email: string;
    rating: number;
    verified?: boolean;
  };
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
  createdAt?: Date;
  updatedAt?: Date;
}

// Search and Filter Types
export interface SearchFilters {
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

export interface SearchResult {
  providers: ServiceProvider[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProviderStats {
  totalProviders: number;
  totalJobs: number;
  averageRating: number;
  topLocations: Array<{ location: string; count: number }>;
  topServices: Array<{ service: string; count: number }>;
}

// Search Analytics Types
export interface SearchEvent {
  searchTerm?: string;
  category?: string;
  location?: string;
  timestamp: number;
  resultsCount: number;
}

export interface PopularSearch {
  term: string;
  count: number;
}

export interface PopularCategory {
  category: string;
  count: number;
}

// UI State Types
export interface SearchUIState {
  isLoading: boolean;
  error: string | null;
  hasResults: boolean;
  showAdvancedFilters: boolean;
  showSuggestions: boolean;
}

// Component Props Types
export interface SearchPageProps {
  initialFilters?: Partial<SearchFilters>;
  enableAnalytics?: boolean;
  showSuggestions?: boolean;
}

export interface ProviderCardProps {
  provider: ServiceProvider;
  onContact?: (provider: ServiceProvider) => void;
  onMessage?: (provider: ServiceProvider) => void;
  showActions?: boolean;
}

// Request Form Types
export interface RequestFormData {
  title: string;
  description: string;
  category: ServiceCategory | "";
  location: string;
  urgency: "low" | "medium" | "high" | "emergency";
  budget: number;
}

export interface RequestFormErrors {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  budget?: string;
  submit?: string;
}

export interface RequestValidationResult {
  isValid: boolean;
  errors: RequestFormErrors;
}

// Budget Suggestion Types
export interface BudgetRange {
  min: number;
  typical: number;
  max: number;
}

export interface BudgetSuggestions {
  [key: string]: BudgetRange;
}

// Service Request Enhancement Types
export interface RequestCreationResult {
  success: boolean;
  request?: ServiceRequest;
  error?: string;
}

export interface RequestDraft {
  title: string;
  description: string;
  category: ServiceCategory | "";
  location: string;
  urgency: "low" | "medium" | "high" | "emergency";
  budget: number;
  savedAt: number;
}

// Error Types
export interface ServiceError {
  message: string;
  code?: string;
  details?: any;
}

// Success Types
export interface RequestSuccessData {
  id: string;
  title: string;
  category: string;
  location: string;
  budget: number;
  urgency: string;
  status: string;
  createdAt: Date;
}
