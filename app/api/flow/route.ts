import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type FlowStep = "destination" | "continent" | "tripType" | "done";

const SYSTEM_PROMPTS: Record<string, string> = {
  destination: `You are a friendly trip planning assistant. The user was asked: "Do you know where you want to go?"
Analyze their message and respond with JSON only (no markdown, no code fences, just raw JSON):
{
  "knows": boolean,
  "destination": string | null,
  "message": string
}
- knows: true if they have a specific place in mind, false otherwise
- destination: place they mentioned (city, country, region), or null
- message: 1-2 sentences. If knows=true: confirm destination and say you will help plan it. If knows=false: friendly acknowledgment and ask which continent interests them.`,

  continent: `You are a friendly trip planning assistant. The user was asked which continent they want to visit.
Analyze their message and respond with JSON only (no markdown, no code fences, just raw JSON):
{
  "continent": string | null,
  "message": string
}
- continent: one of Africa, Asia, Europe, North America, South America, Oceania, or null if unclear
- message: 1-2 sentences. Confirm continent and ask what type of trip they want (give examples: beach, city, mountain, adventure, cultural, relaxing).`,

  tripType: `You are a friendly trip planning assistant. The user was asked what type of trip they want.
Analyze their message and respond with JSON only (no markdown, no code fences, just raw JSON):
{
  "tripType": string,
  "message": string
}
- tripType: the style they described (beach, city, mountain, adventure, cultural, relaxing, etc.)
- message: 1-2 sentences confirming their preferences and saying you have everything needed to suggest great destinations.`,
};

export function nextStepFrom(
  step: FlowStep,
  parsed: Record<string, unknown>
): FlowStep {
  if (step === "destination") return parsed.knows ? "done" : "continent";
  if (step === "continent") return "tripType";
  return "done";
}

export async function callAnthropicLLM(
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  return (data.content?.[0]?.text as string) ?? "";
}

export async function callOpenAILLM(
  systemPrompt: string,
  userMessage: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 256,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message ?? "OpenAI API error");
  return (data.choices?.[0]?.message?.content as string) ?? "";
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { step, userMessage } = (await req.json()) as {
    step: FlowStep;
    userMessage: string;
  };

  const { data: keyRows } = await supabase
    .from("user_api_keys")
    .select("provider, api_key")
    .eq("user_id", user.id);

  const keys = Object.fromEntries(
    (keyRows ?? []).map((k: { provider: string; api_key: string }) => [
      k.provider,
      k.api_key,
    ])
  );

  if (!keys.anthropic && !keys.openai) {
    return NextResponse.json({
      message:
        "Please add an API key (Anthropic or OpenAI) in Settings to continue.",
      nextStep: step,
    });
  }

  const systemPrompt = SYSTEM_PROMPTS[step];
  if (!systemPrompt) {
    return NextResponse.json({ message: "Flow complete.", nextStep: "done" });
  }

  let llmText: string;
  try {
    if (keys.anthropic) {
      llmText = await callAnthropicLLM(systemPrompt, userMessage, keys.anthropic);
    } else {
      llmText = await callOpenAILLM(systemPrompt, userMessage, keys.openai);
    }
  } catch {
    return NextResponse.json({
      message: "Failed to reach AI service. Check your API key in Settings." + keys.openai + ".",
      nextStep: step,
    });
  }

  let parsed: Record<string, unknown> = {};
  try {
    const match = llmText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no json in response");
    parsed = JSON.parse(match[0]);
  } catch {
    return NextResponse.json({
      message: "Hmm, I did not quite get that. Could you rephrase?",
      nextStep: step,
    });
  }

  return NextResponse.json({
    message: (parsed.message as string) ?? "Got it!",
    nextStep: nextStepFrom(step, parsed),
    collectedData: parsed,
  });
}
