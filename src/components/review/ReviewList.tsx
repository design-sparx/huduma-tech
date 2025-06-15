// src/components/shared/ReviewList.tsx
"use client";

import { useState } from "react";

import { Filter, Star, ThumbsUp, User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { formatDate } from "@/lib/formats";
import { cn } from "@/lib/utils";

import type { Review } from "@/lib/services/review";

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  loading?: boolean;
  className?: string;
  showFilters?: boolean;
  maxReviews?: number;
}

interface ReviewWithUser extends Review {
  users?: {
    name: string;
  };
}

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const starSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(value => (
        <Star
          key={value}
          className={cn(
            starSize,
            value <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

function RatingDistribution({
  ratingDistribution,
  totalReviews,
}: {
  ratingDistribution: Record<number, number>;
  totalReviews: number;
}) {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(rating => {
        const count = ratingDistribution[rating] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={rating} className="flex items-center space-x-3 text-sm">
            <div className="flex w-12 items-center space-x-1">
              <span>{rating}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-yellow-400 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-xs text-gray-600">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
  loading = false,
  className,
  showFilters = true,
  maxReviews,
}: ReviewListProps) {
  const [filterRating, setFilterRating] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterRating === "all") return true;
      return review.rating === parseInt(filterRating);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    })
    .slice(0, maxReviews);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  if (totalReviews === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Star className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Be the first to review this service provider!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} size="lg" />
            <p className="mt-2 text-sm text-gray-600">
              Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Rating Distribution */}
          <div>
            <h4 className="mb-3 font-medium text-gray-900">Rating breakdown</h4>
            <RatingDistribution
              ratingDistribution={ratingDistribution}
              totalReviews={totalReviews}
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && reviews.length > 3 && (
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ratings</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="2">2 stars</SelectItem>
                <SelectItem value="1">1 star</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest rated</SelectItem>
                <SelectItem value="lowest">Lowest rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredAndSortedReviews.map((review: ReviewWithUser) => (
            <div
              key={review.id}
              className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {review.users?.name?.charAt(0) || (
                      <User className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Review Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.users?.name || "Anonymous"}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-gray-600">
                          {formatDate(new Date(review.created_at))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="mb-3 leading-relaxed text-gray-700">
                      {review.comment}
                    </p>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      Helpful
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {maxReviews && reviews.length > maxReviews && (
          <div className="mt-6 text-center">
            <Button variant="outline">View all {totalReviews} reviews</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
