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

  const profileUpdates: Record<string, string | null> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };
  if (displayName !== null) profileUpdates.display_name = displayName.trim() || null;
  if (avatarUrl !== null) profileUpdates.avatar_url = avatarUrl.trim() || null;

  const { error } = await supabase
    .from("profiles")
    .upsert(profileUpdates, { onConflict: "user_id" });

  if (error) {
    redirect("/config?error=update_failed");
  }

  revalidatePath("/config");
  revalidatePath("/");
  redirect("/config?success=updated");
}

export async function saveApiKey(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const provider = formData.get("provider") as string;
  const apiKey = (formData.get("api_key") as string)?.trim();

  if (!provider || !apiKey) {
    redirect("/config?error=invalid_key");
  }

  const { error } = await supabase
    .from("user_api_keys")
    .upsert(
      { user_id: user.id, provider, api_key: apiKey, updated_at: new Date().toISOString() },
      { onConflict: "user_id,provider" }
    );

  if (error) {
    redirect("/config?error=key_save_failed");
  }

  revalidatePath("/config");
  redirect("/config?success=key_saved");
}

export async function clearApiKey(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const provider = formData.get("provider") as string;

  if (!provider) {
    redirect("/config?error=invalid_provider");
  }

  await supabase
    .from("user_api_keys")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", provider);

  revalidatePath("/config");
  redirect("/config?success=key_cleared");
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
