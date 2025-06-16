export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  location: string;
  rating: number;
  totalJobs: number;
  verified: boolean; // Computed field (true when verificationStatus === 'approved')
  verificationStatus: "pending" | "approved" | "rejected"; // Single source of truth
  avatar?: string;
  hourlyRate: number;
  bio?: string;
  experienceYears?: number;
  isBlocked?: boolean;
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
    verificationStatus?: "pending" | "approved" | "rejected";
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
  isAdmin?: boolean;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Admin-specific types
export interface AdminUser extends User {
  isAdmin: true;
}

export interface PendingProvider extends ServiceProvider {
  verificationStatus: "pending";
  verificationRequestedAt?: Date;
}

export interface ApprovedProvider extends ServiceProvider {
  verificationStatus: "approved";
  verified: true;
}

export interface RejectedProvider extends ServiceProvider {
  verificationStatus: "rejected";
  verified: false;
}

// Verification workflow types
export interface VerificationRequest {
  providerId: string;
  providerName: string;
  providerEmail: string;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  processedBy?: string;
  processedAt?: Date;
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
  includeUnverified?: boolean; // For admin views
  verificationStatus?: "pending" | "approved" | "rejected"; // For admin filtering
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
  pendingVerifications?: number;
  approvedProviders?: number;
  rejectedProviders?: number;
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
  showVerificationStatus?: boolean; // For admin views
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

// Messaging Types
export interface Message {
  id: string;
  serviceRequestId: string;
  senderId: string;
  senderType: "user" | "provider";
  content: string;
  messageType: "text" | "system";
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  serviceRequestId: string;
  userId: string;
  providerId: string;
  lastMessageAt: Date;
  userUnreadCount: number;
  providerUnreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Populated fields
  request?: ServiceRequest;
  user?: User;
  provider?: ServiceProvider;
  lastMessage?: Message;
}

export interface MessageFormData {
  content: string;
}

export interface ConversationSummary {
  id: string;
  serviceRequestId: string;
  title: string;
  otherPartyName: string;
  otherPartyAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: ServiceRequest["status"];
}

// Chat UI States
export interface ChatUIState {
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  isTyping: boolean;
}

// Reporting Types
export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedProviderId?: string;
  reportedRequestId?: string;
  reportType:
    | "inappropriate_behavior"
    | "fraud"
    | "poor_service"
    | "harassment"
    | "fake_profile"
    | "other";
  description: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
