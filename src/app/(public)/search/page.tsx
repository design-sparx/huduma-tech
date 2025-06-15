"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  CheckCircle2,
  FilterX,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Search as SearchIcon,
  SlidersHorizontal,
  Star,
  TrendingUp,
  User,
  X,
} from "lucide-react";

import { ProviderProfile } from "@/components/shared";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KENYAN_LOCATIONS, SERVICE_CATEGORIES } from "@/constants";
import { useServiceProviders } from "@/hooks";
import { formatPrice } from "@/lib/formats";

import type { ServiceCategory, ServiceProvider } from "@/types";

interface SearchFilters {
  searchTerm: string;
  category: ServiceCategory | "";
  location: string;
  minRating: number;
  maxRate: number;
  sortBy: "rating" | "hourly_rate" | "total_jobs" | "name";
  sortOrder: "asc" | "desc";
}

const RATING_OPTIONS = [
  { value: "0", label: "All Ratings" },
  { value: "3", label: "3+ Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "4.5", label: "4.5+ Stars" },
];

const RATE_OPTIONS = [
  { value: "0", label: "Any Rate" },
  { value: "1000", label: "Under KES 1,000" },
  { value: "1500", label: "Under KES 1,500" },
  { value: "2000", label: "Under KES 2,000" },
];

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated", order: "desc" },
  { value: "hourly_rate", label: "Lowest Price", order: "asc" },
  { value: "total_jobs", label: "Most Experienced", order: "desc" },
  { value: "name", label: "Name A-Z", order: "asc" },
];

const DEFAULT_FILTERS: SearchFilters = {
  searchTerm: "",
  category: "",
  location: "",
  minRating: 0,
  maxRate: 0,
  sortBy: "rating",
  sortOrder: "desc",
};

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: searchParams.get("q") || "",
    category: (searchParams.get("category") as ServiceCategory) || "",
    location: searchParams.get("location") || "",
    minRating: Number(searchParams.get("rating")) || 0,
    maxRate: Number(searchParams.get("maxRate")) || 0,
    sortBy: (searchParams.get("sortBy") as any) || "rating",
    sortOrder: (searchParams.get("sortOrder") as any) || "desc",
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ServiceProvider | null>(null);
  const [showProviderProfile, setShowProviderProfile] = useState(false);

  // Fetch providers with current filters
  const { providers, loading, error, refetch, hasResults, totalCount } =
    useServiceProviders({
      category: filters.category || undefined,
      location: filters.location || undefined,
      searchTerm: filters.searchTerm || undefined,
      minRating: filters.minRating || undefined,
      maxRate: filters.maxRate || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      debounceMs: 300,
    });

  // Update URL when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      if (filters.searchTerm) params.set("q", filters.searchTerm);
      if (filters.category) params.set("category", filters.category);
      if (filters.location) params.set("location", filters.location);
      if (filters.minRating > 0)
        params.set("rating", filters.minRating.toString());
      if (filters.maxRate > 0)
        params.set("maxRate", filters.maxRate.toString());
      if (filters.sortBy !== "rating") params.set("sortBy", filters.sortBy);
      if (filters.sortOrder !== "desc")
        params.set("sortOrder", filters.sortOrder);

      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, router, pathname]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const clearSearchTerm = () => {
    updateFilter("searchTerm", "");
  };

  const clearBasicFilters = () => {
    setFilters(prev => ({
      ...prev,
      category: "",
      location: "",
    }));
  };

  const clearAdvancedFilters = () => {
    setFilters(prev => ({
      ...prev,
      minRating: 0,
      maxRate: 0,
      sortBy: "rating",
      sortOrder: "desc",
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category) count++;
    if (filters.location) count++;
    if (filters.minRating > 0) count++;
    if (filters.maxRate > 0) count++;
    if (filters.sortBy !== "rating" || filters.sortOrder !== "desc") count++;
    return count;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  // Handle provider actions
  const handleViewProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowProviderProfile(true);
  };

  const handleHireProvider = (provider: ServiceProvider) => {
    router.push(`/request?providerId=${provider.id}`);
  };

  const handleContactProvider = (provider: ServiceProvider) => {
    // You can implement a contact modal or redirect to contact page
    window.location.href = `tel:${provider.phone}`;
  };

  const handleMessageProvider = (provider: ServiceProvider) => {
    // You can implement messaging functionality
    window.location.href = `mailto:${provider.email}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Find Service Providers</h2>
          {!loading && (
            <p className="mt-1 text-sm text-gray-600">
              {hasResults
                ? `${totalCount} provider${totalCount === 1 ? "" : "s"} found`
                : "No providers found"}
              {hasActiveFilters && " with current filters"}
            </p>
          )}
        </div>

        {/* Quick Stats and Clear All Button */}
        <div className="flex items-center gap-4">
          {hasResults && !loading && (
            <div className="hidden items-center gap-4 text-sm text-gray-600 md:flex">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Avg:{" "}
                  {(
                    providers.reduce((sum, p) => sum + p.rating, 0) /
                    providers.length
                  ).toFixed(1)}
                  ★
                </span>
              </div>
              <div>
                Rate:{" "}
                {formatPrice(Math.min(...providers.map(p => p.hourlyRate)))} -{" "}
                {formatPrice(Math.max(...providers.map(p => p.hourlyRate)))}
              </div>
            </div>
          )}

          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4 rounded-lg bg-white p-6 shadow-md">
        {/* Main Search Row */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search by name, service, or keyword..."
              value={filters.searchTerm}
              onChange={e => updateFilter("searchTerm", e.target.value)}
              className="w-full pr-10"
            />
            {filters.searchTerm && (
              <button
                onClick={clearSearchTerm}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select
            value={filters.category || "all"}
            onValueChange={value => {
              const categoryValue =
                value === "all" ? "" : (value as ServiceCategory);
              updateFilter("category", categoryValue);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {SERVICE_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.location || "all"}
            onValueChange={value => {
              const locationValue = value === "all" ? "" : value;
              updateFilter("location", locationValue);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {KENYAN_LOCATIONS.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Basic Filters */}
          {(filters.category || filters.location) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearBasicFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          {/* Advanced Filters Toggle */}
          <Dialog
            open={showAdvancedFilters}
            onOpenChange={setShowAdvancedFilters}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  Advanced Filters
                  {(filters.minRating > 0 ||
                    filters.maxRate > 0 ||
                    filters.sortBy !== "rating" ||
                    filters.sortOrder !== "desc") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAdvancedFilters}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear Advanced
                    </Button>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Minimum Rating</label>
                  <Select
                    value={filters.minRating.toString()}
                    onValueChange={value =>
                      updateFilter("minRating", Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RATING_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Maximum Rate</label>
                  <Select
                    value={filters.maxRate.toString()}
                    onValueChange={value =>
                      updateFilter("maxRate", Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RATE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Sort By</label>
                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={value => {
                      const [sortBy, sortOrder] = value.split("-");
                      updateFilter("sortBy", sortBy as any);
                      updateFilter("sortOrder", sortOrder as any);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem
                          key={`${option.value}-${option.order}`}
                          value={`${option.value}-${option.order}`}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    className="flex-1"
                  >
                    <FilterX className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="flex-1"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Filters Display */}
        {(filters.searchTerm ||
          filters.category ||
          filters.location ||
          filters.minRating > 0 ||
          filters.maxRate > 0 ||
          filters.sortBy !== "rating" ||
          filters.sortOrder !== "desc") && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>

            {filters.searchTerm && (
              <Badge variant="secondary" className="gap-1">
                &quot;{filters.searchTerm}&quot;
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("searchTerm", "")}
                />
              </Badge>
            )}

            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                {
                  SERVICE_CATEGORIES.find(c => c.value === filters.category)
                    ?.label
                }
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("category", "")}
                />
              </Badge>
            )}

            {filters.location && (
              <Badge variant="secondary" className="gap-1">
                {filters.location}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("location", "")}
                />
              </Badge>
            )}

            {filters.minRating > 0 && (
              <Badge variant="secondary" className="gap-1">
                {filters.minRating}+ Stars
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("minRating", 0)}
                />
              </Badge>
            )}

            {filters.maxRate > 0 && (
              <Badge variant="secondary" className="gap-1">
                Under {formatPrice(filters.maxRate)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("maxRate", 0)}
                />
              </Badge>
            )}

            {(filters.sortBy !== "rating" || filters.sortOrder !== "desc") && (
              <Badge variant="secondary" className="gap-1">
                Sort:{" "}
                {SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    updateFilter("sortBy", "rating");
                    updateFilter("sortOrder", "desc");
                  }}
                />
              </Badge>
            )}

            {/* Clear All Badge */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Searching providers...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" onClick={refetch} className="mt-2">
            Retry Search
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && hasResults && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map(provider => (
            <div
              key={provider.id}
              className="cursor-pointer rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg"
              onClick={() => handleViewProvider(provider)}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    {provider.avatar ? (
                      <Image
                        src={provider.avatar}
                        alt={provider.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.location}</span>
                    </div>
                  </div>
                </div>
                {provider.verified && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Enhanced Rating Display */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= provider.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">
                      {provider.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({provider.totalJobs} reviews)
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatPrice(provider.hourlyRate)}/hr
                  </div>
                </div>

                {/* Experience Badge */}
                {provider.experienceYears && provider.experienceYears > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {provider.experienceYears} years experience
                  </Badge>
                )}
              </div>

              {/* Services */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium">Services:</h4>
                <div className="flex flex-wrap gap-1">
                  {provider.services.slice(0, 3).map(service => {
                    const category = SERVICE_CATEGORIES.find(
                      cat => cat.value === service
                    );
                    return (
                      <Badge
                        key={service}
                        variant="outline"
                        className="text-xs"
                      >
                        {category?.label || service}
                      </Badge>
                    );
                  })}
                  {provider.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{provider.services.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Bio Preview */}
              {provider.bio && (
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                  {provider.bio}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    handleHireProvider(provider);
                  }}
                >
                  Hire Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    handleContactProvider(provider);
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    handleMessageProvider(provider);
                  }}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && !hasResults && (
        <div className="py-12 text-center">
          <SearchIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No providers found
          </h3>
          <p className="mb-4 text-gray-600">
            Try adjusting your search criteria or filters
          </p>

          {/* Suggestions for no results */}
          {hasActiveFilters && (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-500">Try these suggestions:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {filters.searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter("searchTerm", "")}
                  >
                    Clear search term
                  </Button>
                )}
                {filters.category && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter("category", "")}
                  >
                    All categories
                  </Button>
                )}
                {filters.location && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter("location", "")}
                  >
                    All locations
                  </Button>
                )}
                {(filters.minRating > 0 || filters.maxRate > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAdvancedFilters}
                  >
                    Clear advanced filters
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={clearAllFilters}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FilterX className="mr-2 h-4 w-4" />
                  Clear all filters
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Provider Profile Modal */}
      {selectedProvider && (
        <Dialog
          open={showProviderProfile}
          onOpenChange={setShowProviderProfile}
        >
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <ProviderProfile
              provider={selectedProvider}
              showReviews
              showActions
              onHireProvider={() => handleHireProvider(selectedProvider)}
              onContactProvider={() => handleContactProvider(selectedProvider)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
