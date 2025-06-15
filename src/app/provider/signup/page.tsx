"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle,
  DollarSign,
  Star,
  User,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { KENYAN_LOCATIONS, SERVICE_CATEGORIES } from "@/constants";
import { useAuth } from "@/contexts";
import { signIn, signUp } from "@/lib/services/auth";
import { createServiceProvider } from "@/lib/services/providers";

import type { ServiceCategory } from "@/types";

interface ProviderSignupData {
  // Personal Info
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;

  // Provider Info
  services: ServiceCategory[];
  hourlyRate: number;
  experienceYears: number;
  bio: string;

  // Agreement
  agreedToTerms: boolean;
}

type SignupStep =
  | "personal"
  | "services"
  | "experience"
  | "review"
  | "complete";

const EXPERIENCE_LEVELS = [
  { value: 0, label: "Just starting out", description: "New to the field" },
  { value: 1, label: "1 year", description: "Some experience" },
  { value: 2, label: "2-3 years", description: "Developing skills" },
  { value: 5, label: "5+ years", description: "Experienced professional" },
  { value: 10, label: "10+ years", description: "Highly experienced" },
  { value: 15, label: "15+ years", description: "Expert level" },
];

const RATE_SUGGESTIONS = {
  electrical: { min: 800, typical: 1200, max: 2000 },
  plumbing: { min: 1000, typical: 1500, max: 2500 },
  automotive: { min: 1200, typical: 1800, max: 3000 },
  hvac: { min: 1000, typical: 1600, max: 2800 },
  carpentry: { min: 800, typical: 1300, max: 2200 },
  painting: { min: 600, typical: 1000, max: 1800 },
  general_maintenance: { min: 500, typical: 900, max: 1500 },
};

export default function ProviderSignupPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<SignupStep>("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProviderSignupData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    services: [],
    hourlyRate: 1000,
    experienceYears: 1,
    bio: "",
    agreedToTerms: false,
  });

  // If user is already logged in, skip personal info
  useState(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        location: user.user_metadata?.location || "",
      }));
      setCurrentStep("services");
    }
  });

  const handleServiceToggle = (service: ServiceCategory) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));

    // Update rate suggestion based on selected services
    if (!formData.services.includes(service)) {
      const newServices = [...formData.services, service];
      const avgRate =
        newServices.reduce((sum, s) => {
          const suggestion =
            RATE_SUGGESTIONS[s] || RATE_SUGGESTIONS.general_maintenance;
          return sum + suggestion.typical;
        }, 0) / newServices.length;

      setFormData(prev => ({
        ...prev,
        hourlyRate: Math.round(avgRate),
      }));
    }
  };

  const validateStep = (step: SignupStep): boolean => {
    switch (step) {
      case "personal":
        return !!(
          formData.name &&
          formData.email &&
          formData.password &&
          formData.phone &&
          formData.location
        );
      case "services":
        return formData.services.length > 0;
      case "experience":
        return !!(formData.hourlyRate > 0 && formData.bio.length >= 20);
      case "review":
        return formData.agreedToTerms;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      setError("Please fill in all required fields");
      return;
    }

    setError(null);
    const steps: SignupStep[] = [
      "personal",
      "services",
      "experience",
      "review",
      "complete",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: SignupStep[] = [
      "personal",
      "services",
      "experience",
      "review",
      "complete",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("review")) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create auth account if user isn't logged in
      if (!user) {
        await signUp(formData.email, formData.password, {
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
        });

        // Sign in the new user
        await signIn(formData.email, formData.password);
      }

      // Step 2: Create provider profile
      await createServiceProvider({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        services: formData.services,
        location: formData.location,
        rating: 0,
        totalJobs: 0,
        verified: false, // Will be verified by admin
        hourlyRate: formData.hourlyRate,
        bio: formData.bio,
        experienceYears: formData.experienceYears,
      });

      setCurrentStep("complete");
    } catch (err: any) {
      setError(err.message || "Failed to create provider account");
      console.error("Provider signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => {
    const steps = ["personal", "services", "experience", "review", "complete"];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const renderPersonalStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h2 className="mb-2 text-2xl font-bold">Personal Information</h2>
        <p className="text-gray-600">Tell us about yourself to get started</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter your full name"
            disabled={!!user}
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e =>
              setFormData(prev => ({ ...prev, email: e.target.value }))
            }
            placeholder="Enter your email"
            disabled={!!user}
          />
        </div>

        {!user && (
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={e =>
                setFormData(prev => ({ ...prev, password: e.target.value }))
              }
              placeholder="Create a secure password"
            />
          </div>
        )}

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={e =>
              setFormData(prev => ({ ...prev, phone: e.target.value }))
            }
            placeholder="+254712345678"
            disabled={!!user}
          />
        </div>

        <div>
          <Label htmlFor="location">Primary Location *</Label>
          <Select
            value={formData.location}
            onValueChange={value =>
              setFormData(prev => ({ ...prev, location: value }))
            }
            disabled={!!user}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your location" />
            </SelectTrigger>
            <SelectContent>
              {KENYAN_LOCATIONS.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderServicesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Briefcase className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h2 className="mb-2 text-2xl font-bold">Your Services</h2>
        <p className="text-gray-600">
          What services do you provide? Select all that apply.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SERVICE_CATEGORIES.map(category => {
          const Icon = category.icon;
          const isSelected = formData.services.includes(
            category.value as ServiceCategory
          );

          return (
            <Card
              key={category.value}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-green-500 bg-green-50 shadow-md"
                  : "hover:border-green-200 hover:shadow-sm"
              }`}
              onClick={() =>
                handleServiceToggle(category.value as ServiceCategory)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`h-8 w-8 ${isSelected ? "text-green-600" : "text-gray-500"}`}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{category.label}</h3>
                    <p className="text-sm text-gray-600">
                      Professional {category.label.toLowerCase()}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {formData.services.length > 0 && (
        <div className="rounded-lg bg-green-50 p-4">
          <h4 className="mb-2 font-medium text-green-800">
            Selected Services:
          </h4>
          <div className="flex flex-wrap gap-2">
            {formData.services.map(service => {
              const category = SERVICE_CATEGORIES.find(
                c => c.value === service
              );
              return (
                <Badge key={service} className="bg-green-100 text-green-800">
                  {category?.label}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderExperienceStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Star className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h2 className="mb-2 text-2xl font-bold">Experience & Rates</h2>
        <p className="text-gray-600">
          Help customers understand your expertise
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="experience">Years of Experience *</Label>
          <Select
            value={formData.experienceYears.toString()}
            onValueChange={value =>
              setFormData(prev => ({
                ...prev,
                experienceYears: parseInt(value),
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value.toString()}>
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-gray-600">
                      {level.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="hourlyRate">Hourly Rate (KES) *</Label>
          <div className="relative">
            <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              id="hourlyRate"
              type="number"
              value={formData.hourlyRate}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  hourlyRate: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="1000"
              className="pl-10"
              min="100"
              max="10000"
            />
          </div>
          {formData.services.length > 0 && (
            <div className="mt-2 rounded-lg bg-blue-50 p-3">
              <p className="mb-2 text-sm text-blue-800">
                Suggested rates for your services:
              </p>
              <div className="space-y-1 text-xs text-blue-600">
                {formData.services.map(service => {
                  const suggestion =
                    RATE_SUGGESTIONS[service] ||
                    RATE_SUGGESTIONS.general_maintenance;
                  return (
                    <div key={service} className="flex justify-between">
                      <span>
                        {
                          SERVICE_CATEGORIES.find(c => c.value === service)
                            ?.label
                        }
                        :
                      </span>
                      <span>
                        KES {suggestion.min} - {suggestion.max}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="bio">Professional Bio *</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={e =>
              setFormData(prev => ({ ...prev, bio: e.target.value }))
            }
            placeholder="Describe your experience, specialties, and what makes you a great service provider..."
            className="min-h-[120px]"
          />
          <p className="mt-1 text-sm text-gray-600">
            {formData.bio.length}/500 characters (minimum 20 required)
          </p>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h2 className="mb-2 text-2xl font-bold">Review & Submit</h2>
        <p className="text-gray-600">
          Please review your information before submitting
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{formData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{formData.location}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Services & Experience</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-gray-600">Services:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {formData.services.map(service => {
                  const category = SERVICE_CATEGORIES.find(
                    c => c.value === service
                  );
                  return (
                    <Badge
                      key={service}
                      className="bg-green-100 text-green-800"
                    >
                      {category?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Experience:</span>
              <span className="font-medium">
                {formData.experienceYears} years
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hourly Rate:</span>
              <span className="font-medium">
                KES {formData.hourlyRate.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Bio:</span>
              <p className="mt-1 text-sm">{formData.bio}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start space-x-3 rounded-lg bg-gray-50 p-4">
          <input
            type="checkbox"
            id="terms"
            checked={formData.agreedToTerms}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                agreedToTerms: e.target.checked,
              }))
            }
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{" "}
            <Link href="/terms" className="text-green-600 underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-green-600 underline">
              Privacy Policy
            </Link>
            . I understand that my profile will be reviewed before being
            activated.
          </label>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <div>
        <h2 className="mb-2 text-3xl font-bold text-green-600">
          Welcome to HudumaTech!
        </h2>
        <p className="mb-6 text-lg text-gray-600">
          Your provider account has been created successfully.
        </p>
      </div>

      <Card className="text-left">
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold">What happens next?</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <span className="text-xs font-bold text-green-600">1</span>
              </div>
              <p>
                Our team will review your profile and verify your credentials
                (usually within 24 hours).
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <span className="text-xs font-bold text-green-600">2</span>
              </div>
              <p>
                Once approved, you&apos;ll receive an email confirmation and can
                start accepting requests.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <span className="text-xs font-bold text-green-600">3</span>
              </div>
              <p>
                Access your provider dashboard to manage requests and track your
                earnings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button onClick={() => router.push("/provider-dashboard")} size="lg">
          Go to Provider Dashboard
        </Button>
        <Button variant="outline" onClick={() => router.push("/")} size="lg">
          Back to Home
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Progress Bar */}
        {currentStep !== "complete" && (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
              <span>
                Step{" "}
                {["personal", "services", "experience", "review"].indexOf(
                  currentStep
                ) + 1}{" "}
                of 4
              </span>
              <span>{Math.round(getStepProgress())}% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-600 transition-all duration-300"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <Card>
          <CardContent className="p-8">
            {currentStep === "personal" && renderPersonalStep()}
            {currentStep === "services" && renderServicesStep()}
            {currentStep === "experience" && renderExperienceStep()}
            {currentStep === "review" && renderReviewStep()}
            {currentStep === "complete" && renderCompleteStep()}

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep !== "complete" && (
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === "personal" || loading}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep === "review" ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateStep(currentStep) || loading}
                    className="flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Create Provider Account</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep) || loading}
                    className="flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to Home Link */}
        {currentStep !== "complete" && (
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 underline hover:text-green-600"
            >
              ← Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
