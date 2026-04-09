jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { GET } from "../app/auth/callback/route";
import { createClient } from "@/lib/supabase/server";

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("auth/callback route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exchanges code and redirects to /", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const req = new Request("http://localhost:3000/auth/callback?code=abc123");
    const res = await GET(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects to /login?error=auth_failed when no code", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: jest.fn(),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const req = new Request("http://localhost:3000/auth/callback");
    const res = await GET(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("auth_failed");
  });

  it("redirects to /login?error=auth_failed when exchange fails", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: jest
          .fn()
          .mockResolvedValue({ error: new Error("bad token") }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const req = new Request(
      "http://localhost:3000/auth/callback?code=bad_code"
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("auth_failed");
  });

  it("respects 'next' query param for redirect destination", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const req = new Request(
      "http://localhost:3000/auth/callback?code=abc&next=/trips"
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/trips");
  });
});
