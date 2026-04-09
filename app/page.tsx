import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-white p-8">
      <header className="flex items-center justify-between border-b border-blue-200 pb-4 mb-8">
        <h1 className="text-2xl font-medium text-blue-800">Borbor</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-700">
            {user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email}
          </span>
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
      <p className="text-blue-700">Welcome. Plan your trips here.</p>
    </main>
  );
}
