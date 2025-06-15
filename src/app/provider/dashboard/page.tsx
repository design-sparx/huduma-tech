"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Filter,
  MapPin,
  Search,
  SortAsc,
  SortDesc,
  Star,
  XCircle,
} from "lucide-react";

import { MessageButton } from "@/components/messaging";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { KENYAN_LOCATIONS, SERVICE_CATEGORIES } from "@/constants";
import { useAuth } from "@/contexts";
import { useProviderRequests } from "@/hooks/useProviderRequests";
import { getStatusColor, getUrgencyColor } from "@/lib/colors";
import { formatDate, formatPrice } from "@/lib/formats";
import { getServiceProviderByEmail } from "@/lib/services/providers";

import type { ServiceProvider, ServiceRequest } from "@/types";

type SortField = "createdAt" | "budget" | "urgency" | "location";
type SortOrder = "asc" | "desc";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Get current provider data
  const [currentProvider, setCurrentProvider] =
    useState<ServiceProvider | null>(null);
  const [providerLoading, setProviderLoading] = useState(true);

  // Use the provider requests hook
  const {
    availableRequests,
    myRequests,
    stats,
    loading: requestsLoading,
    error: requestsError,
    acceptRequest,
    updateRequestStatus,
    isUpdating,
  } = useProviderRequests({
    provider: currentProvider || undefined,
    autoRefresh: true,
  });

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"available" | "my-requests">(
    "available"
  );

  // State for modals
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);

  // Load current provider
  React.useEffect(() => {
    const loadProvider = async () => {
      if (!user?.email) {
        setProviderLoading(false);
        return;
      }

      try {
        const provider = await getServiceProviderByEmail(user.email);
        setCurrentProvider(provider);
      } catch (error) {
        // console.error("Error loading provider:", error);
        throw error;
      } finally {
        setProviderLoading(false);
      }
    };

    loadProvider();
  }, [user?.email]);

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    const requests = activeTab === "available" ? availableRequests : myRequests;

    const filtered = requests.filter(request => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          request.title.toLowerCase().includes(searchLower) ||
          request.description.toLowerCase().includes(searchLower) ||
          request.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter !== "all" && request.category !== categoryFilter) {
        return false;
      }

      // Urgency filter
      if (urgencyFilter !== "all" && request.urgency !== urgencyFilter) {
        return false;
      }

      // Location filter
      if (
        locationFilter !== "all" &&
        !request.location.includes(locationFilter)
      ) {
        return false;
      }

      return true;
    });

    // Sort requests
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "budget":
          aValue = a.budget;
          bValue = b.budget;
          break;
        case "urgency":
          const urgencyOrder = { low: 1, medium: 2, high: 3, emergency: 4 };
          aValue = urgencyOrder[a.urgency];
          bValue = urgencyOrder[b.urgency];
          break;
        case "location":
          aValue = a.location;
          bValue = b.location;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    activeTab,
    availableRequests,
    myRequests,
    searchTerm,
    categoryFilter,
    urgencyFilter,
    locationFilter,
    sortField,
    sortOrder,
  ]);

  // Handle request acceptance
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      setShowAcceptConfirm(false);
      setSelectedRequest(null);
    } catch (error) {
      // console.error("Error accepting request:", error);
      throw error;
    }
  };

  // Handle request status update
  const handleUpdateStatus = async (
    requestId: string,
    status: ServiceRequest["status"]
  ) => {
    try {
      await updateRequestStatus(requestId, status);
    } catch (error) {
      // console.error("Error updating request status:", error);
      throw error;
    }
  };

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Get category info
  const getCategoryInfo = (categoryValue: string) => {
    return SERVICE_CATEGORIES.find(cat => cat.value === categoryValue);
  };

  if (providerLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
            <p className="mt-4 text-gray-600">Loading provider dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentProvider) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-orange-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Provider Account Not Found
            </h3>
            <p className="mb-4 text-gray-600">
              We couldn&apos;t find your provider profile. Please complete your
              provider registration.
            </p>
            <Button onClick={() => router.push("/provider/signup")}>
              Complete Provider Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Provider Dashboard</h2>
          <p className="mt-1 text-gray-600">
            Welcome back, {currentProvider?.name}! Manage your requests and grow
            your business.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={currentProvider?.verified ? "default" : "secondary"}>
            {currentProvider?.verified ? "Verified" : "Pending Verification"}
          </Badge>
          <Button
            variant="outline"
            onClick={() => router.push("/provider/profile")}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalAvailable}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalAccepted}
            </div>
            <div className="text-sm text-gray-600">Accepted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats.activeJobs}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.completedJobs}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.totalEarnings)}
            </div>
            <div className="text-sm text-gray-600">Earnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center text-2xl font-bold text-yellow-600">
              {currentProvider?.rating || 0}
              <Star className="ml-1 h-4 w-4 fill-current" />
            </div>
            <div className="text-sm text-gray-600">Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Services */}
      <Card>
        <CardHeader>
          <CardTitle>Your Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentProvider?.services.map(service => {
              const categoryInfo = getCategoryInfo(service);
              const Icon = categoryInfo?.icon || Briefcase;
              return (
                <Badge
                  key={service}
                  className={categoryInfo?.color || "bg-gray-100 text-gray-800"}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {categoryInfo?.label || service}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "available"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Available ({availableRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("my-requests")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "my-requests"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Requests ({myRequests.length})
        </button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {currentProvider?.services.map(service => {
                      const categoryInfo = getCategoryInfo(service);
                      return (
                        <SelectItem key={service} value={service}>
                          {categoryInfo?.label || service}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Urgencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgencies</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
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

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("createdAt")}
                  >
                    Date{" "}
                    {sortField === "createdAt" &&
                      (sortOrder === "asc" ? (
                        <SortAsc className="ml-1 h-3 w-3" />
                      ) : (
                        <SortDesc className="ml-1 h-3 w-3" />
                      ))}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("budget")}
                  >
                    Budget{" "}
                    {sortField === "budget" &&
                      (sortOrder === "asc" ? (
                        <SortAsc className="ml-1 h-3 w-3" />
                      ) : (
                        <SortDesc className="ml-1 h-3 w-3" />
                      ))}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading/Error/Empty States */}
      {requestsLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </CardContent>
        </Card>
      )}

      {requestsError && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{requestsError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!requestsLoading && !requestsError && filteredRequests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {activeTab === "available"
                ? "No available requests"
                : "No requests yet"}
            </h3>
            <p className="mb-4 text-gray-600">
              {activeTab === "available"
                ? "Check back later for new requests."
                : "You haven't accepted any requests yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      {!requestsLoading && !requestsError && filteredRequests.length > 0 && (
        <div className="space-y-4">
          {filteredRequests.map(request => {
            const categoryInfo = getCategoryInfo(request.category);
            const Icon = categoryInfo?.icon || Calendar;

            return (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">
                          {request.title}
                        </h3>
                        <Badge
                          className={`${getUrgencyColor(request.urgency)}`}
                        >
                          {request.urgency.toUpperCase()}
                        </Badge>
                        {activeTab === "my-requests" && (
                          <Badge
                            className={`${getStatusColor(request.status)}`}
                          >
                            {request.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      <p className="mb-3 line-clamp-2 text-gray-600">
                        {request.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Icon className="h-4 w-4" />
                          <span>{categoryInfo?.label || request.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatPrice(request.budget)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(new Date(request.createdAt))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRequestDetails(true);
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </Button>

                    <div className="flex space-x-2">
                      {activeTab === "available" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowAcceptConfirm(true);
                            }}
                            disabled={isUpdating(request.id)}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            {isUpdating(request.id) ? "Accepting..." : "Accept"}
                          </Button>
                          <Button variant="outline" size="sm">
                            <XCircle className="mr-1 h-4 w-4" />
                            Decline
                          </Button>
                        </>
                      )}

                      {activeTab === "my-requests" && (
                        <>
                          {request.status === "accepted" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(request.id, "in_progress")
                              }
                              disabled={isUpdating(request.id)}
                            >
                              {isUpdating(request.id)
                                ? "Starting..."
                                : "Start Work"}
                            </Button>
                          )}
                          {request.status === "in_progress" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(request.id, "completed")
                              }
                              disabled={isUpdating(request.id)}
                            >
                              {isUpdating(request.id)
                                ? "Completing..."
                                : "Mark Complete"}
                            </Button>
                          )}
                          <MessageButton
                            serviceRequest={request}
                            userType="provider"
                            otherPartyName={
                              request.provider?.name || "Customer"
                            }
                            otherPartyPhone={request.provider?.phone}
                            // otherPartyAvatar={request.provider?.avatar}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Request Details Modal */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-semibold">Service Request</h4>
                <p className="text-lg font-medium">{selectedRequest.title}</p>
                <p className="mt-1 text-gray-600">
                  {selectedRequest.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">
                    Category
                  </h5>
                  <p>{getCategoryInfo(selectedRequest.category)?.label}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">
                    Location
                  </h5>
                  <p>{selectedRequest.location}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Budget</h5>
                  <p>{formatPrice(selectedRequest.budget)}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Urgency</h5>
                  <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                    {selectedRequest.urgency.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Status</h5>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Created</h5>
                  <p>{formatDate(new Date(selectedRequest.createdAt))}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Accept Confirmation Modal */}
      <Dialog open={showAcceptConfirm} onOpenChange={setShowAcceptConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this service request?
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <p className="font-medium">{selectedRequest.title}</p>
              <p className="text-sm text-gray-600">
                {selectedRequest.location}
              </p>
              <p className="text-sm font-medium text-green-600">
                {formatPrice(selectedRequest.budget)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAcceptConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedRequest && handleAcceptRequest(selectedRequest.id)
              }
              disabled={
                selectedRequest ? isUpdating(selectedRequest.id) : false
              }
            >
              {selectedRequest && isUpdating(selectedRequest.id)
                ? "Accepting..."
                : "Accept Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
