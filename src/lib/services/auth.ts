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

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          name: userData.name,
          email,
          phone: userData.phone,
          location: userData.location,
        },
      ]);

      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }
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
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
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
