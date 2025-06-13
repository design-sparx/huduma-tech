"use client";

import { useEffect, useState } from "react";

import {
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  Hammer,
  Mail,
  MapPin,
  Paintbrush,
  Phone,
  Plus,
  Search,
  Settings,
  Star,
  User,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getStatusColor, getUrgencyColor } from "@/lib/colors";
import { formatPrice } from "@/lib/formats";

import type { ServiceCategory, ServiceProvider, ServiceRequest } from "@/types";

// Mock data
const mockProviders: ServiceProvider[] = [
  {
    id: "1",
    name: "John Mwangi",
    email: "john@example.com",
    phone: "+254712345678",
    services: ["electrical", "general_maintenance"],
    location: "Nairobi CBD",
    rating: 4.8,
    totalJobs: 127,
    verified: true,
    hourlyRate: 1200,
  },
  {
    id: "2",
    name: "Grace Wanjiku",
    email: "grace@example.com",
    phone: "+254723456789",
    services: ["plumbing", "hvac"],
    location: "Westlands",
    rating: 4.9,
    totalJobs: 89,
    verified: true,
    hourlyRate: 1500,
  },
  {
    id: "3",
    name: "David Kiptoo",
    email: "david@example.com",
    phone: "+254734567890",
    services: ["automotive"],
    location: "Industrial Area",
    rating: 4.7,
    totalJobs: 203,
    verified: true,
    hourlyRate: 1800,
  },
];

const serviceCategories = [
  {
    value: "electrical",
    label: "Electrical Services",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "plumbing",
    label: "Plumbing Services",
    icon: Wrench,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "automotive",
    label: "Car Services",
    icon: Car,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "hvac",
    label: "HVAC Services",
    icon: Wind,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "carpentry",
    label: "Carpentry",
    icon: Hammer,
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "painting",
    label: "Painting",
    icon: Paintbrush,
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "general_maintenance",
    label: "General Maintenance",
    icon: Settings,
    color: "bg-gray-100 text-gray-800",
  },
];

const kenyanLocations = [
  "Nairobi CBD",
  "Westlands",
  "Karen",
  "Kilimani",
  "Lavington",
  "Parklands",
  "Industrial Area",
  "Eastleigh",
  "Kasarani",
  "Embakasi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Machakos",
];

export default function HomePage() {
  const [currentView, setCurrentView] = useState<
    "home" | "search" | "request" | "my-requests"
  >("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ServiceCategory | ""
  >("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [filteredProviders, setFilteredProviders] =
    useState<ServiceProvider[]>(mockProviders);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);

  // New service request form state
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "" as ServiceCategory | "",
    location: "",
    urgency: "medium" as "low" | "medium" | "high" | "emergency",
    budget: 0,
  });

  // Filter providers based on search criteria
  useEffect(() => {
    let filtered = mockProviders;

    if (searchTerm) {
      filtered = filtered.filter(
        provider =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.services.some(service =>
            service.includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(provider =>
        provider.services.includes(selectedCategory)
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(provider =>
        provider.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  }, [searchTerm, selectedCategory, selectedLocation]);

  const handleCreateRequest = () => {
    if (
      newRequest.title &&
      newRequest.description &&
      newRequest.category &&
      newRequest.location &&
      newRequest.budget
    ) {
      const request: ServiceRequest = {
        id: Date.now().toString(),
        userId: "current-user",
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        location: newRequest.location,
        urgency: newRequest.urgency,
        status: "pending",
        budget: newRequest.budget,
        createdAt: new Date(),
      };

      setServiceRequests([...serviceRequests, request]);
      setNewRequest({
        title: "",
        description: "",
        category: "",
        location: "",
        urgency: "medium",
        budget: 0,
      });
      setCurrentView("my-requests");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b-2 border-green-500 bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-green-600 p-2">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-700">HudumaTech</h1>
              <span className="text-sm text-gray-500">
                Kenya&apos;s Premier Service Platform
              </span>
            </div>
            <nav className="hidden space-x-6 md:flex">
              <button
                onClick={() => setCurrentView("home")}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  currentView === "home"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-green-700"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView("search")}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  currentView === "search"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-green-700"
                }`}
              >
                Find Services
              </button>
              <button
                onClick={() => setCurrentView("request")}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  currentView === "request"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-green-700"
                }`}
              >
                Request Service
              </button>
              <button
                onClick={() => setCurrentView("my-requests")}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  currentView === "my-requests"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-green-700"
                }`}
              >
                My Requests ({serviceRequests.length})
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === "home" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="rounded-xl bg-gradient-to-r from-green-600 to-blue-600 p-8 text-center text-white">
              <h2 className="mb-4 text-4xl font-bold">
                Connect with Trusted Professionals
              </h2>
              <p className="mb-6 text-xl">
                Find verified electricians, plumbers, mechanics, and more across
                Kenya
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  onClick={() => setCurrentView("search")}
                  className="bg-white px-8 py-3 text-lg text-green-600 hover:bg-gray-100"
                >
                  Find Services
                </Button>
                <Button
                  onClick={() => setCurrentView("request")}
                  variant="outline"
                  className="border-white px-8 py-3 text-lg text-white hover:bg-white hover:text-green-600"
                >
                  Request Service
                </Button>
              </div>
            </div>

            {/* Service Categories */}
            <div>
              <h3 className="mb-6 text-center text-2xl font-bold">
                Our Services
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {serviceCategories.map(category => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.value}
                      className="cursor-pointer rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                      onClick={() => {
                        setSelectedCategory(category.value as ServiceCategory);
                        setCurrentView("search");
                      }}
                    >
                      <div
                        className={`h-12 w-12 rounded-lg ${category.color} mb-3 flex items-center justify-center`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-semibold">
                        {category.label}
                      </h4>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl bg-white p-8 shadow-md">
              <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                <div>
                  <div className="mb-2 text-3xl font-bold text-green-600">
                    500+
                  </div>
                  <div className="text-gray-600">Verified Professionals</div>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold text-blue-600">
                    10,000+
                  </div>
                  <div className="text-gray-600">Jobs Completed</div>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold text-purple-600">
                    4.8
                  </div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "search" && (
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
                  onValueChange={value =>
                    setSelectedCategory(value as ServiceCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {serviceCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {kenyanLocations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map(provider => (
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
                        <h3 className="text-lg font-semibold">
                          {provider.name}
                        </h3>
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
                        const category = serviceCategories.find(
                          cat => cat.value === service
                        );
                        return (
                          <span
                            key={service}
                            className={`rounded-full px-2 py-1 text-xs ${category?.color || "bg-gray-100 text-gray-800"}`}
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

            {filteredProviders.length === 0 && (
              <div className="py-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No providers found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        )}

        {currentView === "request" && (
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 text-2xl font-bold">Request a Service</h2>

            <div className="space-y-6 rounded-lg bg-white p-6 shadow-md">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Service Title
                </label>
                <Input
                  placeholder="e.g., Fix kitchen sink leak"
                  value={newRequest.title}
                  onChange={e =>
                    setNewRequest({ ...newRequest, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  value={newRequest.description}
                  onChange={e =>
                    setNewRequest({
                      ...newRequest,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <Select
                    value={newRequest.category}
                    onValueChange={value =>
                      setNewRequest({
                        ...newRequest,
                        category: value as ServiceCategory,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <Select
                    value={newRequest.location}
                    onValueChange={value =>
                      setNewRequest({ ...newRequest, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {kenyanLocations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Urgency
                  </label>
                  <Select
                    value={newRequest.urgency}
                    onValueChange={value =>
                      setNewRequest({ ...newRequest, urgency: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Within a week</SelectItem>
                      <SelectItem value="medium">
                        Medium - Within 2-3 days
                      </SelectItem>
                      <SelectItem value="high">
                        High - Within 24 hours
                      </SelectItem>
                      <SelectItem value="emergency">
                        Emergency - ASAP
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Budget (KES)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter your budget"
                    value={newRequest.budget || ""}
                    onChange={e =>
                      setNewRequest({
                        ...newRequest,
                        budget: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateRequest}
                className="w-full"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Service Request
              </Button>
            </div>
          </div>
        )}

        {currentView === "my-requests" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Service Requests</h2>
              <Button onClick={() => setCurrentView("request")}>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </div>

            {serviceRequests.length === 0 ? (
              <div className="rounded-lg bg-white py-12 text-center shadow-md">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No service requests yet
                </h3>
                <p className="mb-4 text-gray-600">
                  Create your first service request to get started
                </p>
                <Button onClick={() => setCurrentView("request")}>
                  Create Request
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceRequests.map(request => (
                  <div
                    key={request.id}
                    className="rounded-lg bg-white p-6 shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 text-lg font-semibold">
                          {request.title}
                        </h3>
                        <p className="mb-3 text-gray-600">
                          {request.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                              {request.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(request.status)}`}
                        >
                          {request.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getUrgencyColor(request.urgency)}`}
                        >
                          {request.urgency.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {serviceCategories.map(category => {
                          if (category.value === request.category) {
                            const Icon = category.icon;
                            return (
                              <span
                                key={category.value}
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${category.color}`}
                              >
                                <Icon className="mr-1 h-3 w-3" />
                                {category.label}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {request.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white px-4 py-2 md:hidden">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentView("home")}
            className={`flex flex-col items-center rounded-lg px-3 py-2 ${
              currentView === "home" ? "text-green-600" : "text-gray-600"
            }`}
          >
            <Settings className="mb-1 h-5 w-5" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setCurrentView("search")}
            className={`flex flex-col items-center rounded-lg px-3 py-2 ${
              currentView === "search" ? "text-green-600" : "text-gray-600"
            }`}
          >
            <Search className="mb-1 h-5 w-5" />
            <span className="text-xs">Search</span>
          </button>
          <button
            onClick={() => setCurrentView("request")}
            className={`flex flex-col items-center rounded-lg px-3 py-2 ${
              currentView === "request" ? "text-green-600" : "text-gray-600"
            }`}
          >
            <Plus className="mb-1 h-5 w-5" />
            <span className="text-xs">Request</span>
          </button>
          <button
            onClick={() => setCurrentView("my-requests")}
            className={`relative flex flex-col items-center rounded-lg px-3 py-2 ${
              currentView === "my-requests" ? "text-green-600" : "text-gray-600"
            }`}
          >
            <Calendar className="mb-1 h-5 w-5" />
            <span className="text-xs">Requests</span>
            {serviceRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {serviceRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
