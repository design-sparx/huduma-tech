"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  Lightbulb,
  MapPin,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { RequestSuccess } from "@/app/(public)/request/components";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts";
import { useServiceCategories, useServiceLocations } from "@/hooks";
import { formatPrice } from "@/lib/formats";
import { createServiceRequest } from "@/lib/services/requests";
import {
  getBudgetSuggestion,
  type ServiceRequestData,
  validateServiceRequest,
} from "@/lib/utils/validation";

import type { ServiceCategory } from "@/types";

interface FormData {
  title: string;
  description: string;
  category: ServiceCategory | "";
  location: string;
  urgency: "low" | "medium" | "high" | "emergency";
  budget: number;
}

const DEFAULT_FORM_DATA: FormData = {
  title: "",
  description: "",
  category: "",
  location: "",
  urgency: "medium",
  budget: 0,
};

// Draft storage key
const DRAFT_STORAGE_KEY = "huduma-tech-request-draft";

export default function RequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { locations } = useServiceLocations();
  const { categories } = useServiceCategories();

  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<any>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft);
        setHasDraft(true);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const hasContent =
      formData.title ||
      formData.description ||
      formData.category ||
      formData.location ||
      formData.budget > 0;

    if (hasContent && !showSuccess) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, showSuccess]);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateServiceRequest(formData as ServiceRequestData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      // Scroll to first error
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (user?.id) {
        const result = await createServiceRequest({
          userId: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category as ServiceCategory,
          location: formData.location,
          urgency: formData.urgency,
          status: "pending",
          budget: formData.budget,
        });

        // Clear draft
        localStorage.removeItem(DRAFT_STORAGE_KEY);

        // Show success
        setCreatedRequest({
          id: result.id,
          title: formData.title,
          category: formData.category,
          location: formData.location,
          budget: formData.budget,
          urgency: formData.urgency,
        });
        setShowSuccess(true);
      }
    } catch (err: any) {
      setErrors({
        submit: err.message || "Failed to create request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setCreatedRequest(null);
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setHasDraft(false);
  };

  const handleViewRequests = () => {
    router.push("/my-requests");
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setFormData(DEFAULT_FORM_DATA);
    setHasDraft(false);
    setErrors({});
  };

  const getBudgetSuggestions = () => {
    if (!formData.category) return null;
    return getBudgetSuggestion(formData.category);
  };

  const budgetSuggestions = getBudgetSuggestions();
  const selectedCategory = categories.find(
    cat => cat.value === formData.category
  );

  if (showSuccess && createdRequest) {
    return (
      <div className="mx-auto max-w-2xl">
        <RequestSuccess
          request={createdRequest}
          onViewRequest={handleViewRequests}
          onCreateAnother={handleCreateAnother}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Request a Service</h2>
        <p className="mt-1 text-gray-600">
          Describe your service needs and get matched with qualified providers
        </p>
      </div>

      {/* Draft Notice */}
      {hasDraft && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Draft restored from previous session
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDraft}
              className="text-blue-600 hover:text-blue-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* General Error */}
            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-600">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Service Title *
              </label>
              <Input
                name="title"
                placeholder="e.g., Fix kitchen sink leak, Install ceiling fan"
                value={formData.title}
                onChange={e => updateField("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description *
              </label>
              <Textarea
                name="description"
                placeholder="Describe your issue in detail. Include any specific requirements, preferred timing, or additional context that would help service providers understand your needs."
                value={formData.description}
                onChange={e => updateField("description", e.target.value)}
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Category and Location */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <Select
                  value={formData.category || "placeholder"}
                  onValueChange={value => {
                    if (value !== "placeholder") {
                      updateField("category", value as ServiceCategory);
                    }
                  }}
                >
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Select category
                    </SelectItem>
                    {categories.map(category => {
                      // const Icon = category.icon;
                      return (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            {/* <Icon className="h-4 w-4" />*/}
                            {category.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <Select
                  value={formData.location || "placeholder"}
                  onValueChange={value => {
                    if (value !== "placeholder") {
                      updateField("location", value);
                    }
                  }}
                >
                  <SelectTrigger
                    className={errors.location ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Select location
                    </SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {location.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Urgency and Budget */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Urgency
                </label>
                <Select
                  value={formData.urgency}
                  onValueChange={value => updateField("urgency", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <div>
                          <div>Low - Within a week</div>
                          <div className="text-xs text-gray-500">
                            Flexible timing
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <div>
                          <div>Medium - Within 2-3 days</div>
                          <div className="text-xs text-gray-500">
                            Standard timing
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <div>
                          <div>High - Within 24 hours</div>
                          <div className="text-xs text-gray-500">
                            Urgent need
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="emergency">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-600" />
                        <div>
                          <div>Emergency - ASAP</div>
                          <div className="text-xs text-gray-500">
                            Immediate attention
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Budget (KES) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    name="budget"
                    type="number"
                    placeholder="Enter your budget"
                    value={formData.budget || ""}
                    onChange={e =>
                      updateField("budget", parseInt(e.target.value) || 0)
                    }
                    className={`pl-10 ${errors.budget ? "border-red-500" : ""}`}
                    min="100"
                    max="1000000"
                  />
                </div>
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
              </div>
            </div>

            {/* Budget Suggestions */}
            {budgetSuggestions && selectedCategory && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800">
                      Budget suggestions for {selectedCategory.label}
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="cursor-pointer border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                        onClick={() =>
                          updateField("budget", budgetSuggestions.min)
                        }
                      >
                        Min: {formatPrice(budgetSuggestions.min)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                        onClick={() =>
                          updateField("budget", budgetSuggestions.typical)
                        }
                      >
                        Typical: {formatPrice(budgetSuggestions.typical)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                        onClick={() =>
                          updateField("budget", budgetSuggestions.max)
                        }
                      >
                        Max: {formatPrice(budgetSuggestions.max)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Creating Request..." : "Create Service Request"}
        </Button>
      </form>

      {/* Help Text */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-gray-900">
          Tips for better results:
        </h3>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Be specific about your requirements and timeline</li>
          <li>
            • Include relevant details like room size, equipment type, etc.
          </li>
          <li>• Set a realistic budget based on the complexity of work</li>
          <li>• Mention any preferred timing or special instructions</li>
        </ul>
      </div>
    </div>
  );
}
