import env from "../config/env";

export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallAiOptions {
  json?: boolean;
}

export interface CallAiResult {
  ok: boolean;
  text?: string;
  reason?: string;
}

export function aiConfigured(): boolean {
  return Boolean(env.AI_API_KEY);
}

export async function callAi(
  messages: AiChatMessage[],
  { json = false }: CallAiOptions = {}
): Promise<CallAiResult> {
  const provider = env.AI_PROVIDER;
  const apiKey = env.AI_API_KEY;
  const model = env.AI_MODEL;

  if (!apiKey) {
    return { ok: false, reason: "AI provider not configured" };
  }
  if (provider !== "openai") {
    return { ok: false, reason: `Unsupported AI provider: ${provider}` };
  }

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!resp.ok) {
      return { ok: false, reason: `AI request failed (${resp.status})` };
    }

    const data = (await resp.json()) as any;
    const text = data?.choices?.[0]?.message?.content ?? "";
    return { ok: true, text };
  } catch (error) {
    console.error("AI request error:", error);
    return { ok: false, reason: "AI request error" };
  }
}
