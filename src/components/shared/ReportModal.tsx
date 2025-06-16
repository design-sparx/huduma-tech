"use client";

import { useState } from "react";

import { AlertTriangle, Flag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { createReport } from "@/lib/services/admin";

interface ReportModalProps {
  reportedUserId?: string;
  reportedProviderId?: string;
  reportedRequestId?: string;
  reportedName: string;
  triggerText?: string;
  triggerVariant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
}

const REPORT_TYPES = [
  { value: "inappropriate_behavior", label: "Inappropriate Behavior" },
  { value: "fraud", label: "Fraud or Scam" },
  { value: "poor_service", label: "Poor Service Quality" },
  { value: "harassment", label: "Harassment" },
  { value: "fake_profile", label: "Fake Profile" },
  { value: "other", label: "Other" },
];

export default function ReportModal({
  reportedUserId,
  reportedProviderId,
  reportedRequestId,
  reportedName,
  triggerText = "Report",
  triggerVariant = "outline",
}: ReportModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to report.");
      return;
    }

    if (!reportType) {
      setError("Please select a report type.");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a description.");
      return;
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const success = await createReport({
        reporterId: user.id,
        reportedUserId,
        reportedProviderId,
        reportedRequestId,
        reportType,
        description: description.trim(),
      });

      if (success) {
        // Reset form and close modal
        setReportType("");
        setDescription("");
        setOpen(false);

        // Show success message (you might want to add a toast notification)
        alert(
          "Report submitted successfully. Our team will review it shortly."
        );
      } else {
        setError("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("An error occurred while submitting the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setReportType("");
      setDescription("");
      setError("");
    }
    setOpen(newOpen);
  };

  if (!user) {
    return null; // Don't show report button if user is not logged in
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          <Flag className="mr-1 h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report {reportedName}
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting inappropriate
            behavior or violations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">What&apos;s the issue?</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide details about the issue..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-muted-foreground text-xs">
              {description.length}/500 characters
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !reportType || !description.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
