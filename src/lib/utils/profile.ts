import type { User } from "@supabase/supabase-js";

/**
 * Get a user display name from Supabase auth user object
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return "Anonymous";

  // Try user metadata first
  if (user.user_metadata?.name) {
    return user.user_metadata.name;
  }

  // Fallback to email
  return user.email || "User";
}

/**
 * Get user phone from metadata
 */
export function getUserPhone(user: User | null): string | null {
  if (!user) return null;
  return user.user_metadata?.phone || null;
}

/**
 * Get user location from metadata
 */
export function getUserLocation(user: User | null): string | null {
  if (!user) return null;
  return user.user_metadata?.location || null;
}

/**
 * Check if user profile is complete
 */
export function isProfileComplete(user: User | null): boolean {
  if (!user) return false;

  const metadata = user.user_metadata || {};
  return !!(metadata.name && metadata.phone && metadata.location && user.email);
}

/**
 * Extract profile data from user metadata
 */
export function extractProfileData(user: User) {
  return {
    id: user.id,
    name: user.user_metadata?.name || "",
    email: user.email || "",
    phone: user.user_metadata?.phone || "",
    location: user.user_metadata?.location || "",
    avatar: user.user_metadata?.avatar || null,
  };
}
