"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/contexts";
import { createReview, getProviderReviews } from "@/lib/services/review";

import type { Review } from "@/lib/services/review";

interface UseReviewsOptions {
  providerId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function useReviews(options: UseReviewsOptions = {}) {
  const { user } = useAuth();
  const { providerId, autoRefresh = false, refreshInterval = 60000 } = options;

  const [data, setData] = useState<ReviewsData>({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews for a provider
  const fetchReviews = useCallback(async () => {
    if (!providerId) {
      setData({
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const reviews = await getProviderReviews(providerId);

      // Calculate statistics
      const totalReviews = reviews.length;
      let averageRating = 0;
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      if (totalReviews > 0) {
        const totalRating = reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        averageRating = Math.round((totalRating / totalReviews) * 10) / 10;

        // Calculate rating distribution
        reviews.forEach(review => {
          ratingDistribution[
            review.rating as keyof typeof ratingDistribution
          ]++;
        });
      }

      setData({
        reviews,
        averageRating,
        totalReviews,
        ratingDistribution,
      });
    } catch (err) {
      setError("Failed to fetch reviews");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  // Submit a new review
  const submitReview = useCallback(
    async (reviewData: {
      serviceRequestId: string;
      providerId: string;
      rating: number;
      comment?: string;
    }) => {
      if (!user) {
        throw new Error("User must be logged in to submit a review");
      }

      setSubmitting(true);
      setError(null);

      try {
        await createReview({
          serviceRequestId: reviewData.serviceRequestId,
          userId: user.id,
          providerId: reviewData.providerId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        });

        // Refresh reviews if we're viewing this provider
        if (providerId === reviewData.providerId) {
          await fetchReviews();
        }

        return true;
      } catch (err: any) {
        setError(err.message || "Failed to submit review");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [user, providerId, fetchReviews]
  );

  // Get reviews by rating
  const getReviewsByRating = useCallback(
    (rating: number) => {
      return data.reviews.filter(review => review.rating === rating);
    },
    [data.reviews]
  );

  // Get recent reviews (last 30 days)
  const getRecentReviews = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return data.reviews.filter(
      review => new Date(review.createdAt) >= thirtyDaysAgo
    );
  }, [data.reviews]);

  // Manual refetch
  const refetch = useCallback(async () => {
    await fetchReviews();
  }, [fetchReviews]);

  // Initial fetch
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !providerId) return;

    const interval = setInterval(() => {
      fetchReviews();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, providerId, fetchReviews]);

  return {
    // Data
    reviews: data.reviews,
    averageRating: data.averageRating,
    totalReviews: data.totalReviews,
    ratingDistribution: data.ratingDistribution,

    // State
    loading,
    error,
    submitting,

    // Actions
    submitReview,
    refetch,

    // Getters
    getReviewsByRating,
    getRecentReviews,

    // Computed values
    hasReviews: data.reviews.length > 0,
    recentReviewsCount: getRecentReviews().length,
  };
}
