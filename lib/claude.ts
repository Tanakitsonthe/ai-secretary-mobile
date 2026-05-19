import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = process.env.CLAUDE_ROUTINE_MODEL ?? "claude-sonnet-4-5-20251022";

export type ClaudeResult = {
  text: string;
  input_tokens: number;
  output_tokens: number;
  model: string;
};

export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  options: { model?: string; maxTokens?: number } = {}
): Promise<ClaudeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });
  const model = options.model ?? DEFAULT_MODEL;
  const maxTokens = options.maxTokens ?? 4000;

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { type: "text"; text: string }).text)
    .join("");

  return {
    text,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    model,
  };
}
