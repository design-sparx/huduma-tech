"use client";

import { useState } from "react";

import {
  Briefcase,
  CheckCircle,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
} from "lucide-react";

import { ReviewList } from "@/components/review";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { SERVICE_CATEGORIES } from "@/constants";
import { useReviews } from "@/hooks";
import { formatPrice } from "@/lib/formats";
import { cn } from "@/lib/utils";

import type { ServiceProvider } from "@/types";

interface ProviderProfileProps {
  provider: ServiceProvider;
  showReviews?: boolean;
  showActions?: boolean;
  onContactProvider?: () => void;
  onHireProvider?: () => void;
  className?: string;
}

function ServiceBadge({ serviceValue }: { serviceValue: string }) {
  const category = SERVICE_CATEGORIES.find(cat => cat.value === serviceValue);
  const Icon = category?.icon || Briefcase;

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {category?.label || serviceValue}
    </Badge>
  );
}

export function ProviderProfile({
  provider,
  showReviews = true,
  showActions = true,
  onContactProvider,
  onHireProvider,
  className,
}: ProviderProfileProps) {
  const [showContactDialog, setShowContactDialog] = useState(false);

  const {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    loading: reviewsLoading,
  } = useReviews({
    providerId: provider.id,
    autoRefresh: false,
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="mb-4 h-24 w-24">
                <AvatarImage src={provider.avatar} alt={provider.name} />
                <AvatarFallback className="text-xl">
                  {provider.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Verification Badge */}
              {provider.verified && (
                <Badge className="mb-2">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verified Provider
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="mb-4 flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    {provider.name}
                  </h1>

                  {/* Rating */}
                  <div className="mb-3 flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-semibold">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      {provider.totalJobs} job
                      {provider.totalJobs !== 1 ? "s" : ""} completed
                    </span>
                  </div>

                  {/* Location */}
                  <div className="mb-3 flex items-center text-gray-600">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{provider.location}</span>
                  </div>

                  {/* Rate */}
                  <div className="mb-4 flex items-center font-semibold text-gray-900">
                    <DollarSign className="mr-1 h-4 w-4" />
                    <span>{formatPrice(provider.hourlyRate)}/hour</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {showActions && (
                  <div className="flex flex-col gap-2 md:ml-4">
                    <Button
                      onClick={onHireProvider}
                      className="w-full md:w-auto"
                    >
                      Hire Provider
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (onContactProvider) {
                          onContactProvider();
                        } else {
                          setShowContactDialog(true);
                        }
                      }}
                      className="w-full md:w-auto"
                    >
                      Contact
                    </Button>
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {provider.services.map(service => (
                    <ServiceBadge key={service} serviceValue={service} />
                  ))}
                </div>
              </div>

              {/* Bio */}
              {provider.bio && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">
                    About
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    {provider.bio}
                  </p>
                </div>
              )}

              {/* Experience */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{provider.totalJobs} jobs completed</span>
                </div>
                {provider.verified && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verified provider</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      {showReviews && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Reviews & Ratings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ReviewList
              reviews={reviews}
              averageRating={averageRating}
              totalReviews={totalReviews}
              ratingDistribution={ratingDistribution}
              loading={reviewsLoading}
              maxReviews={5}
            />
          </CardContent>
        </Card>
      )}

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {provider.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
              <Avatar>
                <AvatarImage src={provider.avatar} alt={provider.name} />
                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{provider.name}</h4>
                <p className="text-sm text-gray-600">{provider.location}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span>{provider.phone}</span>
                </div>
                <Button size="sm" asChild>
                  <a href={`tel:${provider.phone}`}>Call</a>
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span>{provider.email}</span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={`mailto:${provider.email}`}>Email</a>
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Be clear about your requirements and
                timeline when contacting the provider for the best service.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
