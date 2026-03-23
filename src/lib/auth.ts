import { supabase } from "./supabase";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

// ---- Sign Up (email/password) ----
export async function signUpWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`.trim(),
      },
      emailRedirectTo: `https://tapyourboat.com/login`,
    },
  });
  if (error) throw error;
  return data;
}

// ---- Sign In (email/password) ----
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  // Update last_login_at (fire-and-forget)
  if (data.user) {
    supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id)
      .then();
  }
  return data;
}

// ---- Sign Out ----
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ---- Reset Password ----
export async function resetPassword(email: string, redirectUrl?: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  if (error) throw error;
}

// ---- Get Current User ----
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ---- Get User Profile (from profiles table) ----
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

// ---- Check if user is admin ----
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", userId)
    .single();
  return data?.user_type === "admin";
}

// ---- Update user password ----
export async function updateUserPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// ---- Auth State Listener ----
export function onAuthChange(
  callback: (user: User | null) => void
): { unsubscribe: () => void } {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => {
      callback(session?.user ?? null);
    }
  );
  return { unsubscribe: () => subscription.unsubscribe() };
}

// ---- Google OAuth ----
export async function signInWithGoogle(redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo || `https://tapyourboat.com/`,
    },
  });
  if (error) throw error;
  return data;
}
