"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Provider = "google" | "twitter" | "github";

export async function signInWithProvider(provider: Provider) {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=auth_failed");
  }

  redirect(data.url);
}
