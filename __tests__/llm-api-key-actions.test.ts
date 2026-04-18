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

import { saveApiKey, clearApiKey } from "../app/config/actions";
import { createClient } from "@/lib/supabase/server";

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

function makeSupabase(user: object | null, upsertResult = { error: null }, deleteResult = { error: null }) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue(upsertResult),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(deleteResult),
        }),
      }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("saveApiKey", () => {
  beforeEach(() => jest.clearAllMocks());

  it("redirects to /login when no user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null));
    await expect(
      saveApiKey(makeFormData({ provider: "openai", api_key: "sk-test" }))
    ).rejects.toThrow("REDIRECT:/login");
  });

  it("redirects to error when provider missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase({ id: "u1" }));
    await expect(
      saveApiKey(makeFormData({ provider: "", api_key: "sk-test" }))
    ).rejects.toThrow("REDIRECT:/config?error=invalid_key");
  });

  it("redirects to error when api_key missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase({ id: "u1" }));
    await expect(
      saveApiKey(makeFormData({ provider: "openai", api_key: "" }))
    ).rejects.toThrow("REDIRECT:/config?error=invalid_key");
  });

  it("upserts key and redirects on success", async () => {
    const supabase = makeSupabase({ id: "u1" });
    mockCreateClient.mockResolvedValue(supabase);

    await expect(
      saveApiKey(makeFormData({ provider: "anthropic", api_key: "sk-ant-test" }))
    ).rejects.toThrow("REDIRECT:/config?success=key_saved");

    expect(supabase.from).toHaveBeenCalledWith("user_api_keys");
  });

  it("redirects to error on supabase failure", async () => {
    const supabase = makeSupabase({ id: "u1" }, { error: new Error("db fail") });
    mockCreateClient.mockResolvedValue(supabase);

    await expect(
      saveApiKey(makeFormData({ provider: "google", api_key: "AIza-test" }))
    ).rejects.toThrow("REDIRECT:/config?error=key_save_failed");
  });
});

describe("clearApiKey", () => {
  beforeEach(() => jest.clearAllMocks());

  it("redirects to /login when no user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null));
    await expect(
      clearApiKey(makeFormData({ provider: "openai" }))
    ).rejects.toThrow("REDIRECT:/login");
  });

  it("redirects to error when provider missing", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase({ id: "u1" }));
    await expect(
      clearApiKey(makeFormData({ provider: "" }))
    ).rejects.toThrow("REDIRECT:/config?error=invalid_provider");
  });

  it("deletes key and redirects on success", async () => {
    const supabase = makeSupabase({ id: "u1" });
    mockCreateClient.mockResolvedValue(supabase);

    await expect(
      clearApiKey(makeFormData({ provider: "openai" }))
    ).rejects.toThrow("REDIRECT:/config?success=key_cleared");

    expect(supabase.from).toHaveBeenCalledWith("user_api_keys");
  });
});
