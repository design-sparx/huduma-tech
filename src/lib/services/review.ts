import { supabase } from "@/lib/supabase";

export interface Review {
  id: string;
  serviceRequestId: string;
  userId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export async function createReview(review: Omit<Review, "id" | "createdAt">) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          service_request_id: review.serviceRequestId,
          user_id: review.userId,
          provider_id: review.providerId,
          rating: review.rating,
          comment: review.comment,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      throw error;
    }

    // Update provider's average rating
    await updateProviderRating(review.providerId);

    return data;
  } catch (error) {
    console.error("Error in createReview:", error);
    throw error;
  }
}

export async function getProviderReviews(providerId: string) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        users (
          name
        )
      `
      )
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching provider reviews:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getProviderReviews:", error);
    return [];
  }
}

async function updateProviderRating(providerId: string) {
  try {
    // Get all reviews for this provider
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("provider_id", providerId);

    if (reviewsError || !reviews || reviews.length === 0) {
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update provider's rating and total jobs count
    const { error: updateError } = await supabase
      .from("service_providers")
      .update({
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        total_jobs: reviews.length,
      })
      .eq("id", providerId);

    if (updateError) {
      console.error("Error updating provider rating:", updateError);
    }
  } catch (error) {
    console.error("Error in updateProviderRating:", error);
  }
}
