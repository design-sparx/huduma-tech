"use client";

import { useState } from "react";

import { CheckCircle } from "lucide-react";

import { ReviewForm } from "@/components/review";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { useReviews } from "@/hooks";

import type { ServiceRequest } from "@/types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequest: ServiceRequest;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  serviceRequest,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { submitReview, submitting } = useReviews();

  const handleSubmit = async (data: { rating: number; comment: string }) => {
    if (!serviceRequest.providerId) {
      throw new Error("Provider information is missing");
    }

    try {
      await submitReview({
        serviceRequestId: serviceRequest.id,
        providerId: serviceRequest.providerId,
        rating: data.rating,
        comment: data.comment,
      });

      setIsSubmitted(true);

      // Call the callback after a short delay
      setTimeout(() => {
        onReviewSubmitted?.();
        handleClose();
      }, 2000);
    } catch (error) {
      throw error; // Let ReviewForm handle the error display
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isSubmitted ? "Review Submitted!" : "Leave a Review"}
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Thank you for your review!
            </h3>
            <p className="text-gray-600">
              Your feedback helps other customers make informed decisions and
              helps service providers improve their services.
            </p>
          </div>
        ) : (
          <ReviewForm
            serviceRequest={serviceRequest}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
