import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAnthropicLLM, callOpenAILLM } from "@/app/api/flow/route";

export type Suggestion = { city: string; country: string };

export function buildSuggestionsPrompt(
  continent?: string,
  tripType?: string,
  exclude: string[] = [],
  destination?: string
): string {
  const parts: string[] = [];

  if (destination) {
    parts.push(`The user wants to visit ${destination}.`);
    parts.push(`Suggest 5 specific destinations (cities) in or near ${destination} for a great trip.`);
  } else {
    if (continent) parts.push(`Continent: ${continent}.`);
    if (tripType) parts.push(`Trip type: ${tripType}.`);
    parts.push("Suggest 5 destination cities for this trip.");
  }

  if (exclude.length > 0) {
    parts.push(`Do NOT suggest any of these already-seen cities: ${exclude.join(", ")}.`);
  }

  parts.push(
    'Return ONLY a JSON array (no markdown, no explanation) in this exact format: [{"city":"CityName","country":"CountryName"},...]'
  );

  return parts.join(" ");
}

export function parseSuggestions(text: string): Suggestion[] {
  try {
    // Try direct parse first
    const direct = JSON.parse(text);
    if (Array.isArray(direct)) {
      return direct.slice(0, 5).map((s) => ({ city: String(s.city), country: String(s.country) }));
    }
    if (direct?.suggestions && Array.isArray(direct.suggestions)) {
      return direct.suggestions
        .slice(0, 5)
        .map((s: { city: unknown; country: unknown }) => ({ city: String(s.city), country: String(s.country) }));
    }
  } catch {
    // Fall through to regex extraction
  }

  // Extract JSON array from mixed text
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr)) {
        return arr.slice(0, 5).map((s) => ({ city: String(s.city), country: String(s.country) }));
      }
    } catch {
      // ignore
    }
  }

  return [];
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { continent, tripType, destination, exclude = [] } = (await req.json()) as {
    continent?: string;
    tripType?: string;
    destination?: string;
    exclude?: string[];
  };

  const { data: keyRows } = await supabase
    .from("user_api_keys")
    .select("provider, api_key")
    .eq("user_id", user.id);

  const keys = Object.fromEntries(
    (keyRows ?? []).map((k: { provider: string; api_key: string }) => [k.provider, k.api_key])
  );

  if (!keys.anthropic && !keys.openai) {
    return NextResponse.json({ error: "No API key configured. Add one in Settings." });
  }

  const systemPrompt =
    "You are a travel expert. When asked for destination suggestions, return ONLY a JSON array of objects with city and country fields. No markdown, no explanation.";
  const userMessage = buildSuggestionsPrompt(continent, tripType, exclude, destination);

  let llmText: string;
  try {
    if (keys.anthropic) {
      llmText = await callAnthropicLLM(systemPrompt, userMessage, keys.anthropic);
    } else {
      llmText = await callOpenAILLM(systemPrompt, userMessage, keys.openai);
    }
  } catch {
    return NextResponse.json({ error: "Failed to reach AI service. Check your API key in Settings." });
  }

  const suggestions = parseSuggestions(llmText);

  if (suggestions.length === 0) {
    return NextResponse.json({ error: "Could not parse suggestions. Please try again." });
  }

  return NextResponse.json({ suggestions });
}
