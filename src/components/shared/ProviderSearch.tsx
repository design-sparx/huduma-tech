// src/components/shared/ProviderSearch.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  CheckCircle,
  DollarSign,
  Filter,
  MapPin,
  Search,
  Star,
} from "lucide-react";

import { ProviderProfile } from "@/components/shared/ProviderProfile";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useServiceCategories, useServiceLocations } from "@/hooks";
import { useServiceProviders } from "@/hooks/useServiceProviders";
import { formatPrice } from "@/lib/formats";
import { cn } from "@/lib/utils";

import type { ServiceCategory, ServiceProvider } from "@/types";

interface ProviderSearchProps {
  initialCategory?: ServiceCategory;
  initialLocation?: string;
  showFilters?: boolean;
  maxResults?: number;
  onProviderSelect?: (provider: ServiceProvider) => void;
  className?: string;
}

export function ProviderSearch({
  initialCategory,
  initialLocation,
  showFilters = true,
  maxResults,
  onProviderSelect,
  className,
}: ProviderSearchProps) {
  const router = useRouter();
  const { categories } = useServiceCategories();
  const { locations } = useServiceLocations();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<ServiceCategory | undefined>(
    initialCategory
  );
  const [location, setLocation] = useState(initialLocation || "");
  const [minRating, setMinRating] = useState<number | undefined>();
  const [maxRate, setMaxRate] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<"rating" | "hourly_rate" | "total_jobs">(
    "rating"
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modal state
  const [selectedProvider, setSelectedProvider] =
    useState<ServiceProvider | null>(null);
  const [showProviderProfile, setShowProviderProfile] = useState(false);

  // Fetch providers with current filters
  const { providers, loading, error, refetch, hasResults, totalCount } =
    useServiceProviders({
      category,
      location: location || undefined,
      searchTerm: searchTerm || undefined,
      minRating,
      maxRate,
      sortBy,
      sortOrder: "desc",
      debounceMs: 300,
    });

  // Handle provider selection
  const handleProviderClick = (provider: ServiceProvider) => {
    if (onProviderSelect) {
      onProviderSelect(provider);
    } else {
      setSelectedProvider(provider);
      setShowProviderProfile(true);
    }
  };

  // Handle hire provider
  const handleHireProvider = (provider: ServiceProvider) => {
    router.push(`/request?providerId=${provider.id}`);
  };

  // Get category info
  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue);
  };

  const displayedProviders = maxResults
    ? providers.slice(0, maxResults)
    : providers;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search providers by name or service..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={category || "all"}
                onValueChange={value =>
                  setCategory(
                    value === "all" ? undefined : (value as ServiceCategory)
                  )
                }
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => {
                    // const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          {/* <Icon className="h-4 w-4" />*/}
                          {cat.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select
                value={location || "all"}
                onValueChange={value =>
                  setLocation(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {loc.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="total_jobs">Experience</SelectItem>
                      <SelectItem value="hourly_rate">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Minimum Rating
                  </label>
                  <Select
                    value={minRating?.toString() || "all"}
                    onValueChange={value =>
                      setMinRating(
                        value === "all" ? undefined : parseFloat(value)
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any rating</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                      <SelectItem value="4.0">4.0+ stars</SelectItem>
                      <SelectItem value="3.5">3.5+ stars</SelectItem>
                      <SelectItem value="3.0">3.0+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Maximum Rate (KES/hour)
                  </label>
                  <Select
                    value={maxRate?.toString() || "all"}
                    onValueChange={value =>
                      setMaxRate(value === "all" ? undefined : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any rate</SelectItem>
                      <SelectItem value="1000">Under KES 1,000</SelectItem>
                      <SelectItem value="1500">Under KES 1,500</SelectItem>
                      <SelectItem value="2000">Under KES 2,000</SelectItem>
                      <SelectItem value="3000">Under KES 3,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMinRating(undefined);
                      setMaxRate(undefined);
                      setSearchTerm("");
                      setCategory(undefined);
                      setLocation("");
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {hasResults
              ? `${totalCount} provider${totalCount !== 1 ? "s" : ""} found`
              : "No providers found"}
          </p>
          {error && (
            <Button variant="outline" size="sm" onClick={refetch}>
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-gray-200" />
                    <div className="h-3 w-5/6 rounded bg-gray-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && !hasResults && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No providers found
            </h3>
            <p className="mb-4 text-gray-600">
              Try adjusting your search criteria or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategory(undefined);
                setLocation("");
                setMinRating(undefined);
                setMaxRate(undefined);
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Provider Results */}
      {!loading && !error && hasResults && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedProviders.map(provider => (
            <Card
              key={provider.id}
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => handleProviderClick(provider)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.avatar} alt={provider.name} />
                      <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">
                        {provider.name}
                      </h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">
                            {provider.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">
                          {provider.totalJobs} jobs
                        </span>
                        {provider.verified && (
                          <>
                            <span className="text-gray-400">•</span>
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1">
                    {provider.services.slice(0, 3).map(service => {
                      const categoryInfo = getCategoryInfo(service);
                      return (
                        <Badge
                          key={service}
                          variant="outline"
                          className="text-xs"
                        >
                          {categoryInfo?.label || service}
                        </Badge>
                      );
                    })}
                    {provider.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.services.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Bio */}
                  {provider.bio && (
                    <p className="line-clamp-2 text-sm text-gray-600">
                      {provider.bio}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t pt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span className="truncate">{provider.location}</span>
                    </div>
                    <div className="flex items-center font-semibold text-green-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatPrice(provider.hourlyRate)}/hr</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Show More Button */}
      {maxResults && providers.length > maxResults && (
        <div className="text-center">
          <Button variant="outline" onClick={() => router.push("/providers")}>
            View All {totalCount} Providers
          </Button>
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
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
