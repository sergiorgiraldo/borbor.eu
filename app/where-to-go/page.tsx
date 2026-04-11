import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatShell from "./ChatShell";

export default async function WhereToGoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-col h-screen bg-white">
      <header className="flex items-center justify-between border-b border-blue-200 px-8 py-4 shrink-0">
        <h1 className="text-2xl font-medium text-blue-800">Borbor</h1>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-green-700 hover:underline">
            Home
          </a>
          <a href="/config" className="text-sm text-blue-600 hover:underline">
            Settings
          </a>
          <form action="/auth/signout" method="POST">
            <button type="submit" className="text-sm text-blue-600 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="px-8 py-3 border-b border-blue-50 shrink-0">
        <h2 className="text-sm font-medium text-blue-800">Where to go?</h2>
      </div>

      <ChatShell />
    </main>
  );
}
