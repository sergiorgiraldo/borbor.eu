import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateProfile, deleteAccount, saveApiKey, clearApiKey } from "./actions";

export default async function ConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error, success } = await searchParams;
  const meta = user.user_metadata ?? {};

  const { data: apiKeys } = await supabase
    .from("user_api_keys")
    .select("provider")
    .eq("user_id", user.id);

  const configuredProviders = new Set((apiKeys ?? []).map((r: { provider: string }) => r.provider));

  return (
    <main className="min-h-screen bg-white p-8">
      <header className="flex items-center justify-between border-b border-blue-200 pb-4 mb-8">
        <h1 className="text-2xl font-medium text-blue-800">Borbor</h1>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-green-700 hover:underline">
            Home
          </a>
          <form action="/auth/signout" method="POST">
            <button type="submit" className="text-sm text-blue-600 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-md">
        <h2 className="text-lg font-medium text-blue-800 mb-6">Settings</h2>

        {error && (
          <p className="text-sm text-red-600 mb-4">Update failed. Try again.</p>
        )}
        {success && (
          <p className="text-sm text-green-700 mb-4">Profile updated.</p>
        )}

        <form action={updateProfile} className="mb-10">
          <div className="mb-4">
            <label
              htmlFor="display_name"
              className="block text-sm text-blue-800 mb-1"
            >
              Display name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={meta.full_name ?? ""}
              className="w-full border border-blue-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="Your name"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="avatar_url"
              className="block text-sm text-blue-800 mb-1"
            >
              Profile picture URL
            </label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="url"
              defaultValue={meta.avatar_url ?? ""}
              className="w-full border border-blue-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="https://example.com/photo.jpg"
            />
            {meta.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meta.avatar_url}
                alt="Profile"
                className="mt-2 w-12 h-12 rounded-full object-cover border border-blue-200"
              />
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Save changes
          </button>
        </form>

        <div className="border-t border-blue-100 pt-6 mb-10">
          <h3 className="text-sm font-medium text-blue-800 mb-4">LLM API Keys</h3>
          <p className="text-sm text-gray-500 mb-4">Keys stored server-side. Used by trip planning features.</p>

          {(["openai", "anthropic", "google"] as const).map((provider) => {
            const configured = configuredProviders.has(provider);
            const label = provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Anthropic" : "Google Gemini";
            return (
              <div key={provider} className="mb-4 p-3 border border-blue-100 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-800">{label}</span>
                  {configured ? (
                    <span className="text-xs text-green-700 font-medium">Configured</span>
                  ) : (
                    <span className="text-xs text-gray-400">Not set</span>
                  )}
                </div>
                <form action={saveApiKey} className="flex gap-2 mb-1">
                  <input type="hidden" name="provider" value={provider} />
                  <input
                    name="api_key"
                    type="password"
                    placeholder={configured ? "Replace existing key" : "Paste API key"}
                    className="flex-1 border border-blue-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </form>
                {configured && (
                  <form action={clearApiKey}>
                    <input type="hidden" name="provider" value={provider} />
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear key
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-red-100 pt-6">
          <h3 className="text-sm font-medium text-red-700 mb-2">
            Delete account
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            This will sign you out. Account deletion is permanent.
          </p>
          <form action={deleteAccount}>
            <button
              type="submit"
              className="px-4 py-2 border border-red-400 text-red-600 text-sm rounded hover:bg-red-50 transition-colors"
            >
              Delete my account
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
