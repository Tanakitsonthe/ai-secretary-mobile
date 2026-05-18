import { NextRequest } from "next/server";
import { getAgent, AgentId } from "@/lib/agents";

export const runtime = "edge";

type Message = { role: "user" | "assistant"; content: string };

// Try models in order. If rate-limited (429) or fails, fall through.
// Mix of free models from different providers + paid fallback (very cheap).
const MODEL_CHAIN = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "meta-llama/llama-3.1-70b-instruct:free",
  "mistralai/mistral-nemo:free",
  "meta-llama/llama-3.3-70b-instruct", // paid fallback ~$0.13/M in, $0.39/M out
];

async function tryModel(
  model: string,
  apiKey: string,
  systemPrompt: string,
  messages: Message[]
): Promise<Response> {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ai-secretary-mobile.vercel.app",
      "X-Title": "AI Secretary",
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
    }),
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY not set on server" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = (await req.json()) as {
    agentId: AgentId;
    messages: Message[];
  };

  const agent = getAgent(body.agentId);

  let upstream: Response | null = null;
  let lastError = "";
  let modelUsed = "";

  for (const model of MODEL_CHAIN) {
    const res = await tryModel(model, apiKey, agent.systemPrompt, body.messages);
    if (res.ok) {
      upstream = res;
      modelUsed = model;
      break;
    }
    // Read error for retry decision
    const errText = await res.text();
    lastError = `${model}: ${res.status} — ${errText.slice(0, 200)}`;
    if (res.status === 429 || res.status === 502 || res.status === 503) {
      // Rate-limited or upstream — try next model
      continue;
    }
    // Other errors (401 bad key, etc.) — fail fast
    return new Response(
      JSON.stringify({ error: lastError }),
      { status: res.status, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!upstream) {
    return new Response(
      JSON.stringify({
        error: `ทุก model rate-limited — ลองอีกครั้งใน 1 นาที. Last: ${lastError}`,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body!.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const payload = trimmed.slice(6);
            if (payload === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const obj = JSON.parse(payload);
              const delta = obj.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // skip non-JSON keepalive lines
            }
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
