import { NextRequest, NextResponse } from "next/server";

// Mock @supabase/ssr
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

import { createServerClient } from "@supabase/ssr";

const mockCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`);
}

function makeSupabaseClient(user: object | null) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("proxy (auth guard)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects unauthenticated user from / to /login", async () => {
    mockCreateServerClient.mockReturnValue(makeSupabaseClient(null));
    const { proxy } = await import("../proxy");
    const req = makeRequest("/");
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects unauthenticated user from /dashboard to /login", async () => {
    mockCreateServerClient.mockReturnValue(makeSupabaseClient(null));
    const { proxy } = await import("../proxy");
    const req = makeRequest("/dashboard");
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("allows unauthenticated user to access /login", async () => {
    mockCreateServerClient.mockReturnValue(makeSupabaseClient(null));
    const { proxy } = await import("../proxy");
    const req = makeRequest("/login");
    const res = await proxy(req);
    expect(res.status).not.toBe(307);
  });

  it("allows unauthenticated user to access /auth/callback", async () => {
    mockCreateServerClient.mockReturnValue(makeSupabaseClient(null));
    const { proxy } = await import("../proxy");
    const req = makeRequest("/auth/callback");
    const res = await proxy(req);
    expect(res.status).not.toBe(307);
  });

  it("redirects authenticated user from /login to /", async () => {
    mockCreateServerClient.mockReturnValue(
      makeSupabaseClient({ id: "u1", email: "a@b.com" })
    );
    const { proxy } = await import("../proxy");
    const req = makeRequest("/login");
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/");
  });

  it("allows authenticated user to access /", async () => {
    mockCreateServerClient.mockReturnValue(
      makeSupabaseClient({ id: "u1", email: "a@b.com" })
    );
    const { proxy } = await import("../proxy");
    const req = makeRequest("/");
    const res = await proxy(req);
    expect(res.status).not.toBe(307);
  });
});
