import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAgent, AgentId } from "@/lib/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

type Message = { role: "user" | "assistant"; content: string };
type Body = { agentId: AgentId; messages: Message[] };

const MODEL = process.env.CLAUDE_CHAT_MODEL ?? "claude-haiku-4-5-20251001";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  const agent = getAgent(body.agentId);

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return streamFromAnthropic(anthropicKey, agent.systemPrompt, body.messages);
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    return streamFromOpenRouter(openrouterKey, agent.systemPrompt, body.messages);
  }

  return new Response(
    JSON.stringify({
      error:
        "ตั้งค่า ANTHROPIC_API_KEY บน Vercel ก่อน หรือ OPENROUTER_API_KEY เป็น fallback",
    }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}

function streamFromAnthropic(
  apiKey: string,
  systemPrompt: string,
  messages: Message[]
): Response {
  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: systemPrompt,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "unknown";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
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

const FALLBACK_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-4-31b-it:free",
];

async function streamFromOpenRouter(
  apiKey: string,
  systemPrompt: string,
  messages: Message[]
): Promise<Response> {
  let upstream: Response | null = null;
  let lastError = "";

  for (const model of FALLBACK_MODELS) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 1024,
      }),
    });
    if (res.ok) {
      upstream = res;
      break;
    }
    lastError = `${model}: ${res.status}`;
  }

  if (!upstream) {
    return new Response(
      JSON.stringify({ error: `Fallback failed: ${lastError}` }),
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
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {}
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
