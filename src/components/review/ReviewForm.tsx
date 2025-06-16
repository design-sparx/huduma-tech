"use client";

import { useState } from "react";

import { Star } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";

import type { ServiceRequest } from "@/types";

interface ReviewFormProps {
  serviceRequest: ServiceRequest;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

const ratingLabels = {
  1: "Poor - Service did not meet expectations",
  2: "Fair - Service was below average",
  3: "Good - Service met expectations",
  4: "Very Good - Service exceeded expectations",
  5: "Excellent - Outstanding service quality",
};

export function ReviewForm({
  serviceRequest,
  onSubmit,
  isSubmitting = false,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    if (comment.trim().length < 10) {
      newErrors.comment = "Please provide at least 10 characters of feedback";
    }

    if (comment.trim().length > 500) {
      newErrors.comment = "Comment must be less than 500 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      await onSubmit({ rating, comment: comment.trim() });
    } catch (error: any) {
      setErrors({ submit: "Failed to submit review. Please try again." });
      console.log(
        `Failed to submit review. Please try again. ${error.message}`
      );
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Rate Your Experience</CardTitle>
        <p className="text-sm text-gray-600">
          How was your experience with{" "}
          {serviceRequest.provider?.name || "the service provider"}?
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Details */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900">
              {serviceRequest.title}
            </h4>
            <p className="text-sm text-gray-600">{serviceRequest.category}</p>
          </div>

          {/* Rating */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Rating *
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    type="button"
                    className={cn(
                      "relative h-8 w-8 transition-transform hover:scale-110",
                      "rounded focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:outline-none"
                    )}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        value <= displayRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-200"
                      )}
                    />
                  </button>
                ))}
              </div>

              {displayRating > 0 && (
                <p className="text-sm text-gray-600">
                  {ratingLabels[displayRating as keyof typeof ratingLabels]}
                </p>
              )}

              {errors.rating && (
                <p className="text-sm text-red-600">{errors.rating}</p>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Your Review *
            </label>
            <Textarea
              placeholder="Tell others about your experience. What went well? Any areas for improvement?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              className={cn(
                "resize-none",
                errors.comment ? "border-red-500" : ""
              )}
            />
            <div className="mt-1 flex items-center justify-between">
              <div>
                {errors.comment && (
                  <p className="text-sm text-red-600">{errors.comment}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {comment.length}/500 characters
              </p>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Submitting Review..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
