"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Search as SearchIcon,
  Star,
  User,
} from "lucide-react";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { KENYAN_LOCATIONS, SERVICE_CATEGORIES } from "@/constants";
import { useServiceProviders } from "@/hooks";
import { formatPrice } from "@/lib/formats";

import type { ServiceCategory } from "@/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get(
    "category"
  ) as ServiceCategory | null;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ServiceCategory | ""
  >(initialCategory || "");
  const [selectedLocation, setSelectedLocation] = useState("");

  const {
    providers,
    loading: providersLoading,
    error: providersError,
    refetch: refetchProviders,
  } = useServiceProviders({
    category: selectedCategory || undefined,
    location: selectedLocation || undefined,
    searchTerm: searchTerm || undefined,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Find Service Providers</h2>

      {/* Search Filters */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            placeholder="Search by name or service..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedCategory}
            onValueChange={value => {
              if (value === "all") {
                setSelectedCategory("");
              } else {
                setSelectedCategory(value as ServiceCategory);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
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
            value={selectedLocation}
            onValueChange={value => {
              if (value === "all") {
                setSelectedLocation("");
              } else {
                setSelectedLocation(value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
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
        </div>
      </div>

      {/* Loading State */}
      {providersLoading && (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading providers...</p>
        </div>
      )}

      {/* Error State */}
      {providersError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">{providersError}</p>
          <Button variant="outline" onClick={refetchProviders} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Results */}
      {!providersLoading && !providersError && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map(provider => (
            <div
              key={provider.id}
              className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <User className="h-6 w-6 text-green-600" />
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
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>

              <div className="mb-4">
                <div className="mb-2 flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="font-semibold">{provider.rating}</span>
                  </div>
                  <span className="text-gray-500">
                    ({provider.totalJobs} jobs)
                  </span>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {formatPrice(provider.hourlyRate)}/hour
                </div>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 font-medium">Services:</h4>
                <div className="flex flex-wrap gap-1">
                  {provider.services.map(service => {
                    const category = SERVICE_CATEGORIES.find(
                      cat => cat.value === service
                    );
                    return (
                      <span
                        key={service}
                        className={`rounded-full px-2 py-1 text-xs ${
                          category?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category?.label || service}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!providersLoading && !providersError && providers.length === 0 && (
        <div className="py-12 text-center">
          <SearchIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No providers found
          </h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
