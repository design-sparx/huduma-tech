"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { KENYAN_LOCATIONS, SERVICE_CATEGORIES } from "@/constants";

import type { ServiceRequest } from "@/types";

const editRequestSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Please provide more details (at least 20 characters)")
    .max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Please select a service category"),
  location: z.string().min(1, "Please select your location"),
  urgency: z.enum(["low", "medium", "high", "emergency"]),
  budget: z
    .number()
    .min(100, "Minimum budget is KES 100")
    .max(1000000, "Maximum budget is KES 1,000,000"),
});

type EditRequestFormData = z.infer<typeof editRequestSchema>;

interface EditRequestModalProps {
  request: ServiceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    requestId: string,
    updates: Partial<ServiceRequest>
  ) => Promise<void>;
  isLoading?: boolean;
}

export function EditRequestModal({
  request,
  open,
  onOpenChange,
  onSave,
  isLoading = false,
}: EditRequestModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<EditRequestFormData>({
    resolver: zodResolver(editRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      urgency: "medium",
      budget: 0,
    },
  });

  // Reset form when request changes
  useEffect(() => {
    if (request) {
      form.reset({
        title: request.title,
        description: request.description,
        category: request.category,
        location: request.location,
        urgency: request.urgency,
        budget: request.budget,
      });
    }
  }, [request, form]);

  const handleSave = async (data: EditRequestFormData) => {
    if (!request) return;

    setIsSaving(true);
    try {
      await onSave(request.id, {
        title: data.title,
        description: data.description,
        category: data.category as ServiceRequest["category"],
        location: data.location,
        urgency: data.urgency,
        budget: data.budget,
      });
      onOpenChange(false);
    } catch (error) {
      // console.error("Error saving request:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Service Request</DialogTitle>
          <DialogDescription>
            Update your service request details. Only pending requests can be
            edited.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Fix electrical wiring in kitchen"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue in detail..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map(category => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            <div className="flex items-center space-x-2">
                              <category.icon className="h-4 w-4" />
                              <span>{category.label}</span>
                            </div>
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KENYAN_LOCATIONS.map(location => (
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
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">
                          Low - Can wait a few days
                        </SelectItem>
                        <SelectItem value="medium">
                          Medium - Within this week
                        </SelectItem>
                        <SelectItem value="high">
                          High - Within 24 hours
                        </SelectItem>
                        <SelectItem value="emergency">
                          Emergency - Immediate
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (KES)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter your budget"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
