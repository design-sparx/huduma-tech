import { supabase } from "@/lib/supabase";

export async function signUp(
  email: string,
  password: string,
  userData: {
    name: string;
    phone: string;
    location: string;
  }
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
          location: userData.location,
        },
      },
    });

    if (error) {
      console.error("Error signing up:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in signUp:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in signIn:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in signOut:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting current session:", error);
      return null;
    }

    return session?.user ?? null;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    phone?: string;
    location?: string;
    avatar?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
}

// New provider-specific functions
export async function checkIfUserIsProvider(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .select("id")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking provider status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error in checkIfUserIsProvider:", error);
    return false;
  }
}

export async function getProviderProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching provider profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getProviderProfile:", error);
    return null;
  }
}

export async function sendProviderWelcomeEmail(email: string, name: string) {
  try {
    // This would integrate with your email service
    // For now, we'll just log it
    console.log(`Welcome email would be sent to ${email} for provider ${name}`);

    // You can integrate with services like:
    // - Supabase Edge Functions
    // - SendGrid
    // - Mailgun
    // - Resend

    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

export async function requestProviderVerification(providerId: string) {
  try {
    // This would trigger a verification workflow
    // For now, we'll update a verification request timestamp
    const { error } = await supabase
      .from("service_providers")
      .update({
        verification_requested_at: new Date().toISOString(),
      })
      .eq("id", providerId);

    if (error) {
      console.error("Error requesting verification:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in requestProviderVerification:", error);
    throw error;
  }
}

// Helper function to validate provider signup data
export function validateProviderSignupData(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  services: string[];
  hourlyRate: number;
  experienceYears: number;
  bio: string;
}) {
  const errors: string[] = [];

  if (!data.name || data.name.length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
    errors.push("Please provide a valid email address");
  }

  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (!data.phone || !/^\+254\d{9}$/.test(data.phone)) {
    errors.push("Please provide a valid Kenyan phone number (+254XXXXXXXXX)");
  }

  if (!data.location) {
    errors.push("Please select your location");
  }

  if (!data.services || data.services.length === 0) {
    errors.push("Please select at least one service");
  }

  if (!data.hourlyRate || data.hourlyRate < 100 || data.hourlyRate > 10000) {
    errors.push("Hourly rate must be between KES 100 and KES 10,000");
  }

  if (data.experienceYears < 0 || data.experienceYears > 50) {
    errors.push("Please provide valid years of experience");
  }

  if (!data.bio || data.bio.length < 20) {
    errors.push("Bio must be at least 20 characters long");
  }

  if (data.bio && data.bio.length > 500) {
    errors.push("Bio must be less than 500 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
