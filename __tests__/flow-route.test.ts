import { nextStepFrom, callAnthropicLLM, callOpenAILLM } from "../app/api/flow/route";
import type { FlowStep } from "../app/api/flow/route";

// --- nextStepFrom ---

describe("nextStepFrom", () => {
  it("destination + knows=true → done", () => {
    expect(nextStepFrom("destination", { knows: true })).toBe("done");
  });

  it("destination + knows=false → continent", () => {
    expect(nextStepFrom("destination", { knows: false })).toBe("continent");
  });

  it("destination + knows missing → continent", () => {
    expect(nextStepFrom("destination", {})).toBe("continent");
  });

  it("continent → tripType", () => {
    expect(nextStepFrom("continent", { continent: "Europe" })).toBe("tripType");
  });

  it("tripType → done", () => {
    expect(nextStepFrom("tripType", { tripType: "beach" })).toBe("done");
  });

  it("done → done", () => {
    expect(nextStepFrom("done", {})).toBe("done");
  });
});

// --- callAnthropicLLM ---

describe("callAnthropicLLM", () => {
  beforeEach(() => jest.resetAllMocks());

  it("returns text from response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        content: [{ text: '{"knows":true,"destination":"Paris","message":"Got it!"}' }],
      }),
    }) as jest.Mock;

    const result = await callAnthropicLLM("system", "I want to go to Paris", "sk-ant-key");
    expect(result).toBe('{"knows":true,"destination":"Paris","message":"Got it!"}');
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns empty string when content missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    }) as jest.Mock;

    const result = await callAnthropicLLM("system", "hello", "sk-ant-key");
    expect(result).toBe("");
  });
});

// --- callOpenAILLM ---

describe("callOpenAILLM", () => {
  beforeEach(() => jest.resetAllMocks());

  it("returns text from response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: '{"continent":"Europe","message":"Europe!"}' } }],
      }),
    }) as jest.Mock;

    const result = await callOpenAILLM("system", "Europe", "sk-openai-key");
    expect(result).toBe('{"continent":"Europe","message":"Europe!"}');
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns empty string when choices missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    }) as jest.Mock;

    const result = await callOpenAILLM("system", "hello", "sk-openai-key");
    expect(result).toBe("");
  });
});

// --- POST handler ---

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { POST } from "../app/api/flow/route";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

function makeRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/flow", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function makeSupabase(
  user: object | null,
  keyRows: Array<{ provider: string; api_key: string }> = []
) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: keyRows, error: null }),
      }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("POST /api/flow", () => {
  beforeEach(() => jest.resetAllMocks());

  it("returns 401 when no user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null));
    const res = await POST(makeRequest({ step: "destination", userMessage: "yes" }));
    expect(res.status).toBe(401);
  });

  it("returns no_key message when user has no keys", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase({ id: "u1" }, []));
    const res = await POST(makeRequest({ step: "destination", userMessage: "yes" }));
    const body = await res.json();
    expect(body.message).toContain("Settings");
    expect(body.nextStep).toBe("destination");
  });

  it("calls anthropic and returns nextStep=done when user knows destination", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "anthropic", api_key: "sk-ant" }])
    );
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        content: [
          {
            text: JSON.stringify({
              knows: true,
              destination: "Tokyo",
              message: "Tokyo it is!",
            }),
          },
        ],
      }),
    }) as jest.Mock;

    const res = await POST(makeRequest({ step: "destination", userMessage: "Tokyo" }));
    const body = await res.json();
    expect(body.nextStep).toBe("done");
    expect(body.message).toBe("Tokyo it is!");
  });

  it("returns nextStep=continent when user does not know destination", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "anthropic", api_key: "sk-ant" }])
    );
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        content: [
          {
            text: JSON.stringify({
              knows: false,
              destination: null,
              message: "No problem! Which continent?",
            }),
          },
        ],
      }),
    }) as jest.Mock;

    const res = await POST(makeRequest({ step: "destination", userMessage: "not sure" }));
    const body = await res.json();
    expect(body.nextStep).toBe("continent");
  });

  it("returns nextStep=tripType from continent step", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "openai", api_key: "sk-oai" }])
    );
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                continent: "Europe",
                message: "Europe! What type of trip?",
              }),
            },
          },
        ],
      }),
    }) as jest.Mock;

    const res = await POST(makeRequest({ step: "continent", userMessage: "Europe" }));
    const body = await res.json();
    expect(body.nextStep).toBe("tripType");
  });

  it("returns nextStep=done from tripType step", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "anthropic", api_key: "sk-ant" }])
    );
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        content: [
          {
            text: JSON.stringify({
              tripType: "beach",
              message: "Great! Beach trip in Europe.",
            }),
          },
        ],
      }),
    }) as jest.Mock;

    const res = await POST(makeRequest({ step: "tripType", userMessage: "beach" }));
    const body = await res.json();
    expect(body.nextStep).toBe("done");
  });

  it("returns fallback when LLM returns unparseable JSON", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "anthropic", api_key: "sk-ant" }])
    );
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        content: [{ text: "not json at all" }],
      }),
    }) as jest.Mock;

    const res = await POST(makeRequest({ step: "destination", userMessage: "hmm" }));
    const body = await res.json();
    expect(body.nextStep).toBe("destination");
    expect(body.message).toContain("rephrase");
  });

  it("returns error message when LLM fetch throws", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "anthropic", api_key: "sk-ant" }])
    );
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error")) as jest.Mock;

    const res = await POST(makeRequest({ step: "destination", userMessage: "Paris" }));
    const body = await res.json();
    expect(body.nextStep).toBe("destination");
    expect(body.message).toContain("Settings");
  });
});
