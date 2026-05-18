"use client";
import { useEffect, useRef, useState } from "react";
import { AGENTS, AgentId, getAgent } from "@/lib/agents";

type Message = { role: "user" | "assistant"; content: string };

const AGENT_LIST: AgentId[] = [
  "english-coach",
  "fitness-trainer",
  "stock-tutor",
  "crypto-tutor",
  "webdev-mentor",
  "daily-briefer",
  "design-polisher",
  "general",
];

export default function ChatPage() {
  const [agentId, setAgentId] = useState<AgentId>("english-coach");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const agent = getAgent(agentId);

  // Reset on agent change
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [agentId]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, messages: next }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages([...next, { role: "assistant", content: "" }]);

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        setMessages([
          ...next,
          { role: "assistant", content: assistantText },
        ]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header + agent selector */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          💬 Chat
        </h1>
        <div className="flex gap-1 overflow-x-auto mt-2 pb-1 -mx-4 px-4">
          {AGENT_LIST.map((id) => {
            const a = AGENTS[id];
            const active = id === agentId;
            return (
              <button
                key={id}
                onClick={() => setAgentId(id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {a.icon} {a.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">{agent.icon}</div>
            <h2 className="font-semibold">{agent.name}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {agent.description}
            </p>
            <div className="mt-6 mx-auto max-w-sm p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-left">
              {agent.greeting}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 rounded-bl-sm"
              }`}
            >
              {m.content || (loading && i === messages.length - 1 ? "..." : "")}
            </div>
          </div>
        ))}

        {error && (
          <div className="mx-auto max-w-md p-3 rounded-lg bg-red-50 dark:bg-red-950 text-xs text-red-700 dark:text-red-300">
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur px-3 py-2">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`พิมพ์หา ${agent.name}...`}
            rows={1}
            className="flex-1 resize-none rounded-2xl px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="shrink-0 rounded-full w-10 h-10 bg-blue-600 text-white font-bold disabled:opacity-40 transition"
            aria-label="ส่ง"
          >
            ➤
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 text-center">
          ใช้ Llama 3.3 70B (free via OpenRouter)
        </p>
      </div>
    </div>
  );
}
