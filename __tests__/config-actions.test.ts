jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { updateProfile, deleteAccount } from "../app/config/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

function makeSupabase(user: object | null, updateUserResult = { error: null }) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
      updateUser: jest.fn().mockResolvedValue(updateUserResult),
      signOut: jest.fn().mockResolvedValue({}),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

describe("config/actions - updateProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /login when no user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null));
    await expect(
      updateProfile(makeFormData({ display_name: "Test" }))
    ).rejects.toThrow("REDIRECT:/login");
  });

  it("calls updateUser with display name and redirects on success", async () => {
    const supabase = makeSupabase({ id: "u1", user_metadata: {} });
    mockCreateClient.mockResolvedValue(supabase);

    await expect(
      updateProfile(makeFormData({ display_name: "Alice", avatar_url: "" }))
    ).rejects.toThrow("REDIRECT:/config?success=updated");

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { full_name: "Alice" },
    });
  });

  it("includes avatar_url when provided", async () => {
    const supabase = makeSupabase({ id: "u1", user_metadata: {} });
    mockCreateClient.mockResolvedValue(supabase);

    await expect(
      updateProfile(
        makeFormData({
          display_name: "Bob",
          avatar_url: "https://example.com/pic.jpg",
        })
      )
    ).rejects.toThrow("REDIRECT:/config?success=updated");

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { full_name: "Bob", avatar_url: "https://example.com/pic.jpg" },
    });
  });

  it("skips empty fields", async () => {
    const supabase = makeSupabase({ id: "u1", user_metadata: {} });
    mockCreateClient.mockResolvedValue(supabase);

    await expect(
      updateProfile(makeFormData({ display_name: "  ", avatar_url: "" }))
    ).rejects.toThrow("REDIRECT:/config?success=updated");

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ data: {} });
  });

  it("redirects to /config?error=update_failed on supabase error", async () => {
    const supabase = makeSupabase(
      { id: "u1", user_metadata: {} },
      { error: new Error("fail") }
    );
    mockCreateClient.mockResolvedValue(supabase);

    await expect(
      updateProfile(makeFormData({ display_name: "X" }))
    ).rejects.toThrow("REDIRECT:/config?error=update_failed");
  });
});

describe("config/actions - deleteAccount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /login when no user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null));
    await expect(deleteAccount()).rejects.toThrow("REDIRECT:/login");
  });

  it("signs out and redirects to /login?deleted=true", async () => {
    const supabase = makeSupabase({ id: "u1", user_metadata: {} });
    mockCreateClient.mockResolvedValue(supabase);

    await expect(deleteAccount()).rejects.toThrow(
      "REDIRECT:/login?deleted=true"
    );
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
