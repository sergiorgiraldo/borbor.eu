import { buildSuggestionsPrompt, parseSuggestions } from "../app/api/suggestions/route";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { POST } from "../app/api/suggestions/route";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

function makeRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/suggestions", {
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

// --- buildSuggestionsPrompt ---

describe("buildSuggestionsPrompt", () => {
  it("includes continent and tripType in prompt", () => {
    const prompt = buildSuggestionsPrompt("Europe", "beach", []);
    expect(prompt).toContain("Europe");
    expect(prompt).toContain("beach");
  });

  it("includes exclusions when provided", () => {
    const prompt = buildSuggestionsPrompt("Asia", "cultural", ["Bangkok", "Tokyo"]);
    expect(prompt).toContain("Bangkok");
    expect(prompt).toContain("Tokyo");
  });

  it("works with no exclusions", () => {
    const prompt = buildSuggestionsPrompt("Europe", "city", []);
    expect(prompt).toBeTruthy();
  });

  it("works with destination override (known destination)", () => {
    const prompt = buildSuggestionsPrompt(undefined, undefined, [], "France");
    expect(prompt).toContain("France");
  });
});

// --- parseSuggestions ---

describe("parseSuggestions", () => {
  it("parses valid JSON array", () => {
    const input = JSON.stringify([
      { city: "Paris", country: "France" },
      { city: "Berlin", country: "Germany" },
    ]);
    const result = parseSuggestions(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ city: "Paris", country: "France", lat: undefined, lng: undefined });
  });

  it("parses JSON with lat/lng coordinates", () => {
    const input = JSON.stringify([
      { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
      { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
    ]);
    const result = parseSuggestions(input);
    expect(result).toHaveLength(2);
    expect(result[0].lat).toBe(48.8566);
    expect(result[0].lng).toBe(2.3522);
    expect(result[1].lat).toBe(52.52);
  });

  it("parses JSON wrapped in object with suggestions key", () => {
    const input = JSON.stringify({
      suggestions: [
        { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
        { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
      ],
    });
    const result = parseSuggestions(input);
    expect(result).toHaveLength(2);
    expect(result[0].city).toBe("Rome");
    expect(result[0].lat).toBe(41.9028);
  });

  it("extracts JSON array from mixed text", () => {
    const input = `Here are suggestions: [{"city":"Lisbon","country":"Portugal","lat":38.7169,"lng":-9.1395}]`;
    const result = parseSuggestions(input);
    expect(result).toHaveLength(1);
    expect(result[0].city).toBe("Lisbon");
    expect(result[0].lat).toBe(38.7169);
  });

  it("returns empty array on invalid JSON", () => {
    const result = parseSuggestions("not json");
    expect(result).toEqual([]);
  });

  it("limits to 5 results", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      city: `City${i}`,
      country: "Country",
      lat: i * 10,
      lng: i * 5,
    }));
    const result = parseSuggestions(JSON.stringify(many));
    expect(result).toHaveLength(5);
  });
});

// --- buildSuggestionsPrompt includes lat/lng ---

describe("buildSuggestionsPrompt lat/lng", () => {
  it("requests lat and lng in output format", () => {
    const prompt = buildSuggestionsPrompt("Europe", "beach", []);
    expect(prompt).toContain("lat");
    expect(prompt).toContain("lng");
  });
});

// --- POST /api/suggestions ---

describe("POST /api/suggestions", () => {
  beforeEach(() => jest.resetAllMocks());

  it("returns 401 when no user", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase(null));
    const res = await POST(makeRequest({ continent: "Europe", tripType: "beach" }));
    expect(res.status).toBe(401);
  });

  it("returns no_key message when user has no keys", async () => {
    mockCreateClient.mockResolvedValue(makeSupabase({ id: "u1" }, []));
    const res = await POST(makeRequest({ continent: "Europe", tripType: "beach" }));
    const body = await res.json();
    expect(body.error).toContain("API key");
  });

  it("returns 5 suggestions from anthropic LLM", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "anthropic", api_key: "sk-ant" }])
    );
    const suggestions = [
      { city: "Barcelona", country: "Spain" },
      { city: "Nice", country: "France" },
      { city: "Amalfi", country: "Italy" },
      { city: "Dubrovnik", country: "Croatia" },
      { city: "Santorini", country: "Greece" },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        content: [{ text: JSON.stringify(suggestions) }],
      }),
    }) as jest.Mock;

    const res = await POST(
      makeRequest({ continent: "Europe", tripType: "beach", exclude: [] })
    );
    const body = await res.json();
    expect(body.suggestions).toHaveLength(5);
    expect(body.suggestions[0]).toHaveProperty("city");
    expect(body.suggestions[0]).toHaveProperty("country");
  });

  it("returns 5 suggestions from openai LLM", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "openai", api_key: "sk-oai" }])
    );
    const suggestions = [
      { city: "Bali", country: "Indonesia" },
      { city: "Phuket", country: "Thailand" },
      { city: "Boracay", country: "Philippines" },
      { city: "Gili Islands", country: "Indonesia" },
      { city: "Ko Samui", country: "Thailand" },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(suggestions) } }],
      }),
    }) as jest.Mock;

    const res = await POST(
      makeRequest({ continent: "Asia", tripType: "beach", exclude: [] })
    );
    const body = await res.json();
    expect(body.suggestions).toHaveLength(5);
  });

  it("returns error on LLM failure", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "anthropic", api_key: "sk-ant" }])
    );
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error")) as jest.Mock;

    const res = await POST(makeRequest({ continent: "Europe", tripType: "beach" }));
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("passes exclude list to avoid duplicates", async () => {
    mockCreateClient.mockResolvedValue(
      makeSupabase({ id: "u1" }, [{ provider: "anthropic", api_key: "sk-ant" }])
    );
    const suggestions = [
      { city: "Amsterdam", country: "Netherlands" },
      { city: "Prague", country: "Czech Republic" },
      { city: "Vienna", country: "Austria" },
      { city: "Budapest", country: "Hungary" },
      { city: "Warsaw", country: "Poland" },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        content: [{ text: JSON.stringify(suggestions) }],
      }),
    }) as jest.Mock;

    await POST(
      makeRequest({
        continent: "Europe",
        tripType: "city",
        exclude: ["Barcelona", "Nice"],
      })
    );

    const callBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body
    );
    // The system prompt or user message should include the excluded cities
    const promptText = JSON.stringify(callBody);
    expect(promptText).toContain("Barcelona");
    expect(promptText).toContain("Nice");
  });
});
