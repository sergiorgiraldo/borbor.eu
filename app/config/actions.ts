"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = formData.get("display_name") as string;
  const avatarUrl = formData.get("avatar_url") as string;

  const updates: Record<string, string> = {};
  if (displayName?.trim()) updates.full_name = displayName.trim();
  if (avatarUrl?.trim()) updates.avatar_url = avatarUrl.trim();

  const { error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) {
    redirect("/config?error=update_failed");
  }

  revalidatePath("/config");
  revalidatePath("/");
  redirect("/config?success=updated");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Sign out first, then delete via admin API (requires service role on backend)
  // For now: sign out and redirect — full delete requires server-side admin call
  await supabase.auth.signOut();
  redirect("/login?deleted=true");
}
