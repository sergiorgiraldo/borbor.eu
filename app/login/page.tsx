import { signInWithProvider } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-8 border border-blue-200 rounded-lg shadow-sm">
        <h1 className="text-2xl font-medium text-blue-800 mb-2 text-center">
          Borbor
        </h1>
        <p className="text-sm text-green-700 mb-8 text-center">
          Plan your trips
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4 text-center">
            Login failed. Try again.
          </p>
        )}

        <div className="flex flex-col gap-4">
          <form
            action={async () => {
              "use server";
              await signInWithProvider("google");
            }}
          >
            <button
              type="submit"
              className="w-full py-2 px-4 border border-blue-300 text-blue-800 rounded hover:bg-blue-50 transition-colors"
            >
              Sign in with Google
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signInWithProvider("github");
            }}
          >
            <button
              type="submit"
              className="w-full py-2 px-4 border border-blue-300 text-blue-800 rounded hover:bg-blue-50 transition-colors"
            >
              Sign in with GitHub
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signInWithProvider("twitter");
            }}
          >
            <button
              type="submit"
              className="w-full py-2 px-4 border border-blue-300 text-blue-800 rounded hover:bg-blue-50 transition-colors"
            >
              Sign in with Twitter / X
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
