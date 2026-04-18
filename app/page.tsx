import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const displayName =
    profile?.display_name ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email;
  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url;

  return (
    <main className="min-h-screen bg-white p-8">
      <header className="flex items-center justify-between border-b border-blue-200 pb-4 mb-8">
        <h1 className="text-2xl font-medium text-blue-800">Borbor</h1>
        <div className="flex items-center gap-4">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-blue-200"
            />
          )}
          <span className="text-sm text-green-700">{displayName}</span>
          <a href="/config" className="text-sm text-blue-600 hover:underline">
            Settings
          </a>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-blue-600 hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="space-y-4">
        <p className="text-blue-700">Welcome. Plan your trips here.</p>
        <a
          href="/where-to-go"
          className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Where to go?
        </a>
      </div>
    </main>
  );
}
