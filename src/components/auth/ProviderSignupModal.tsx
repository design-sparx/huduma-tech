"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Clock, UserPlus } from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { signUp, validateProviderSignupData } from "@/lib/services/auth";
import { createServiceProvider } from "@/lib/services/providers";

const SERVICE_OPTIONS = [
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "automotive", label: "Automotive" },
  { value: "hvac", label: "HVAC" },
  { value: "carpentry", label: "Carpentry" },
  { value: "painting", label: "Painting" },
  { value: "general_maintenance", label: "General Maintenance" },
];

const LOCATION_OPTIONS = [
  "Nairobi CBD",
  "Westlands",
  "Karen",
  "Kilimani",
  "Lavington",
  "Industrial Area",
  "Kasarani",
  "Embakasi",
  "Ngong Road",
  "Thika Road",
];

const providerSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .regex(
      /^\+254\d{9}$/,
      "Please provide a valid Kenyan phone number (+254XXXXXXXXX)"
    ),
  location: z.string().min(1, "Please select your location"),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  hourlyRate: z
    .number()
    .min(100, "Minimum rate is KES 100")
    .max(10000, "Maximum rate is KES 10,000"),
  experienceYears: z
    .number()
    .min(0, "Experience cannot be negative")
    .max(50, "Experience seems too high"),
  bio: z
    .string()
    .min(20, "Bio must be at least 20 characters")
    .max(500, "Bio must be less than 500 characters"),
});

type ProviderSignupForm = z.infer<typeof providerSignupSchema>;

interface ProviderSignupModalProps {
  triggerText?: string;
  onSuccess?: () => void;
}

export default function ProviderSignupModal({
  triggerText = "Join as Provider",
  onSuccess,
}: ProviderSignupModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupStage, setSignupStage] = useState<
    "form" | "submitting" | "success" | "error"
  >("form");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const form = useForm<ProviderSignupForm>({
    resolver: zodResolver(providerSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "+254",
      location: "",
      services: [],
      hourlyRate: 1000,
      experienceYears: 0,
      bio: "",
    },
  });

  const onSubmit = async (data: ProviderSignupForm) => {
    try {
      setIsSubmitting(true);
      setSignupStage("submitting");
      setErrorMessage("");

      // Validate data using the existing validation function
      const validation = validateProviderSignupData({
        ...data,
        password: data.password,
      });

      if (!validation.isValid) {
        setErrorMessage(validation.errors.join(", "));
        setSignupStage("error");
        return;
      }

      // Step 1: Create auth user
      const authResult = await signUp(data.email, data.password, {
        name: data.name,
        phone: data.phone,
        location: data.location,
      });

      if (!authResult.user) {
        throw new Error("Failed to create user account");
      }

      // Step 2: Create provider profile (with pending verification status)
      await createServiceProvider({
        id: authResult.user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        services: data.services,
        location: data.location,
        rating: 0,
        totalJobs: 0,
        verificationStatus: "pending", // Will be false until admin approval
        hourlyRate: data.hourlyRate,
        bio: data.bio,
        experienceYears: data.experienceYears,
      });

      setSignupStage("success");

      // Close modal after a delay and trigger success callback
      setTimeout(() => {
        setOpen(false);
        onSuccess?.();
        router.push("/provider/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Provider signup error:", error);
      setErrorMessage(
        error.message || "Failed to create provider account. Please try again."
      );
      setSignupStage("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleService = (service: string) => {
    const currentServices = form.getValues("services");
    if (currentServices.includes(service)) {
      form.setValue(
        "services",
        currentServices.filter(s => s !== service)
      );
    } else {
      form.setValue("services", [...currentServices, service]);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && signupStage !== "submitting") {
      // Reset form when closing
      form.reset();
      setSignupStage("form");
      setErrorMessage("");
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Join as Service Provider</DialogTitle>
          <DialogDescription>
            Create your provider account and start offering services to
            customers.
          </DialogDescription>
        </DialogHeader>

        {signupStage === "submitting" && (
          <div className="py-8 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
            <h3 className="mb-2 text-lg font-semibold">
              Creating Your Account
            </h3>
            <p className="text-muted-foreground">
              Please wait while we set up your provider profile...
            </p>
          </div>
        )}

        {signupStage === "success" && (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h3 className="mb-2 text-lg font-semibold">
              Account Created Successfully!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your provider account has been created and is pending
              verification.
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
              <h4 className="mb-2 font-medium text-blue-900">
                What&apos;s Next?
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Our team will review your application</li>
                <li>• Verification typically takes 1-2 business days</li>
                <li>• You&apos;ll receive an email once approved</li>
                <li>• Then you can start accepting service requests</li>
              </ul>
            </div>
          </div>
        )}

        {signupStage === "error" && (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold">Signup Failed</h3>
            <p className="mb-4 text-red-600">{errorMessage}</p>
            <Button onClick={() => setSignupStage("form")}>Try Again</Button>
          </div>
        )}

        {signupStage === "form" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+254712345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a secure password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATION_OPTIONS.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <FormLabel>Services Offered</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICE_OPTIONS.map(service => {
                        const isSelected = form
                          .watch("services")
                          .includes(service.value);
                        return (
                          <Badge
                            key={service.value}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer justify-center py-2"
                            onClick={() => toggleService(service.value)}
                          >
                            {service.label}
                          </Badge>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (KES)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="100"
                          max="10000"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell customers about your experience, specializations, and what makes you unique..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-900">
                  Before You Continue
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Your application will be reviewed by our team</li>
                  <li>• Approval typically takes 1-2 business days</li>
                  <li>• You&apos;ll need to verify your email address</li>
                  <li>• Ensure all information is accurate</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Provider Account
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
