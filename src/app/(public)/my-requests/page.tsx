"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit2,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Star,
  Trash2,
} from "lucide-react";

import { EditRequestModal } from "@/app/(public)/my-requests/components";
import { ReviewModal } from "@/components/shared/ReviewModal";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
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
import { useServiceCategories, useServiceRequests } from "@/hooks";
import { getStatusColor, getUrgencyColor } from "@/lib/colors";
import { formatDate, formatPrice } from "@/lib/formats";
import {
  updateServiceRequest,
  updateServiceRequestStatus,
} from "@/lib/services/requests";

import type { ServiceRequest } from "@/types";

type SortField = "createdAt" | "budget" | "status" | "urgency";
type SortOrder = "asc" | "desc";

interface RequestStats {
  total: number;
  pending: number;
  accepted: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
}

export default function MyRequestsPage() {
  const {
    requests: serviceRequests,
    loading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useServiceRequests();
  const { categories } = useServiceCategories();

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);

  // State for modals
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showEditRequest, setShowEditRequest] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState<string | null>(
    null
  );

  // Calculate request statistics
  const requestStats: RequestStats = useMemo(() => {
    const stats = serviceRequests.reduce(
      (acc, request) => {
        acc.total++;
        acc[request.status as keyof typeof acc]++;
        if (request.status === "completed") {
          acc.totalSpent += request.budget;
        }
        return acc;
      },
      {
        total: 0,
        pending: 0,
        accepted: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0,
      } as RequestStats
    );
    return stats;
  }, [serviceRequests]);

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    const filtered = serviceRequests.filter(request => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          request.title.toLowerCase().includes(searchLower) ||
          request.description.toLowerCase().includes(searchLower) ||
          request.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && request.category !== categoryFilter) {
        return false;
      }

      // Urgency filter
      if (urgencyFilter !== "all" && request.urgency !== urgencyFilter) {
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
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "urgency":
          const urgencyOrder = { low: 1, medium: 2, high: 3, emergency: 4 };
          aValue = urgencyOrder[a.urgency];
          bValue = urgencyOrder[b.urgency];
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
    serviceRequests,
    searchTerm,
    statusFilter,
    categoryFilter,
    urgencyFilter,
    sortField,
    sortOrder,
  ]);

  // Handle request update/edit
  const handleUpdateRequest = async (
    requestId: string,
    updates: Partial<ServiceRequest>
  ) => {
    try {
      await updateServiceRequest(requestId, updates);
      await refetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      throw error;
    }
  };

  // Handle request cancellation
  const handleCancelRequest = async (requestId: string) => {
    try {
      setCancellingRequest(requestId);
      await updateServiceRequestStatus(requestId, "cancelled");
      await refetchRequests();
      setShowCancelConfirm(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error cancelling request:", error);
      throw error;
    } finally {
      setCancellingRequest(null);
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
    return categories.find(cat => cat.value === categoryValue);
  };

  // Handle review submission
  const handleReviewSubmitted = () => {
    refetchRequests(); // Refresh to potentially update any review-related data
  };

  // Check if request can be reviewed
  const canReviewRequest = (request: ServiceRequest) => {
    return request.status === "completed" && request.providerId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Service Requests</h2>
          <p className="mt-1 text-gray-600">
            Manage and track your service requests
          </p>
        </div>
        <Button asChild>
          <Link href="/request">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {!requestsLoading && serviceRequests.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {requestStats.total}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {requestStats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {requestStats.accepted}
              </div>
              <div className="text-sm text-gray-600">Accepted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {requestStats.inProgress}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {requestStats.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(requestStats.totalSpent)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search requests by title, description, or location..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>

            {/* Filters Row */}
            {showFilters && (
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
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

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center space-x-1"
                  >
                    <span>Date</span>
                    {sortField === "createdAt" &&
                      (sortOrder === "asc" ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      ))}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("budget")}
                    className="flex items-center space-x-1"
                  >
                    <span>Budget</span>
                    {sortField === "budget" &&
                      (sortOrder === "asc" ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      ))}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {requestsLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
            <p className="mt-4 text-gray-600">Loading your requests...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {requestsError && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{requestsError}</span>
            </div>
            <Button
              variant="outline"
              onClick={refetchRequests}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!requestsLoading && !requestsError && serviceRequests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No service requests yet
            </h3>
            <p className="mb-4 text-gray-600">
              Create your first service request to get started
            </p>
            <Button asChild>
              <Link href="/request">Create Request</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {!requestsLoading &&
        !requestsError &&
        serviceRequests.length > 0 &&
        filteredAndSortedRequests.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No requests match your filters
              </h3>
              <p className="mb-4 text-gray-600">
                Try adjusting your search criteria or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setUrgencyFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Requests List */}
      {!requestsLoading &&
        !requestsError &&
        filteredAndSortedRequests.length > 0 && (
          <div className="space-y-4">
            {filteredAndSortedRequests.map(request => {
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
                            className={`${getStatusColor(request.status)}`}
                          >
                            {request.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge
                            className={`${getUrgencyColor(request.urgency)}`}
                          >
                            {request.urgency.toUpperCase()}
                          </Badge>
                        </div>

                        <p className="mb-3 line-clamp-2 text-gray-600">
                          {request.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Icon className="h-4 w-4" />
                            <span>
                              {categoryInfo?.label || request.category}
                            </span>
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
                            <span>
                              {formatDate(new Date(request.createdAt))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Provider Info */}
                    {request.provider && (
                      <div className="mb-4 rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {request.provider.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {request.provider.name}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{request.provider.rating}</span>
                                </div>
                                {request.provider.verified && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Phone className="mr-1 h-4 w-4" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="mr-1 h-4 w-4" />
                              Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

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
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowEditRequest(true);
                              }}
                            >
                              <Edit2 className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowCancelConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {canReviewRequest(request) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowReviewModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Star className="mr-1 h-4 w-4" />
                            Leave Review
                          </Button>
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

              {selectedRequest.provider && (
                <div>
                  <h4 className="mb-2 font-semibold">Assigned Provider</h4>
                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedRequest.provider.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {selectedRequest.provider.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedRequest.provider.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedRequest.provider.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {selectedRequest.provider.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Request Modal */}
      <EditRequestModal
        request={selectedRequest}
        open={showEditRequest}
        onOpenChange={setShowEditRequest}
        onSave={handleUpdateRequest}
        isLoading={false}
      />

      {/* Review Modal */}
      {selectedRequest && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          serviceRequest={selectedRequest}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this service request? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <p className="font-medium">{selectedRequest.title}</p>
              <p className="text-sm text-gray-600">
                {selectedRequest.description}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
            >
              Keep Request
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedRequest && handleCancelRequest(selectedRequest.id)
              }
              disabled={!!cancellingRequest}
            >
              {cancellingRequest ? "Cancelling..." : "Cancel Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
