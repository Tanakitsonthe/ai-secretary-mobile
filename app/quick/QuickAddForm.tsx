"use client";

import { useState, useEffect, useRef } from "react";
import { addTask } from "./actions";

type Status =
  | { kind: "idle" }
  | { kind: "listening" }
  | { kind: "submitting" }
  | { kind: "success"; id: string }
  | { kind: "error"; message: string };

type Priority = "P0" | "P1" | "P2" | "P3";

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: Event & { error?: string }) => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function QuickAddForm() {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("P2");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setVoiceSupported(getRecognitionCtor() !== null);
  }, []);

  function startListening() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const recog = new Ctor();
    recog.lang = "th-TH";
    recog.interimResults = true;
    recog.continuous = false;
    let finalText = "";
    recog.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interim += res[0].transcript;
      }
      setText((finalText + interim).trim());
    };
    recog.onerror = (e) => {
      setStatus({
        kind: "error",
        message: `voice: ${e.error || "unknown"}`,
      });
    };
    recog.onend = () => {
      setStatus({ kind: "idle" });
      recogRef.current = null;
    };
    recogRef.current = recog;
    setStatus({ kind: "listening" });
    recog.start();
  }

  function stopListening() {
    recogRef.current?.stop();
  }

  async function submit() {
    if (!text.trim()) return;
    setStatus({ kind: "submitting" });
    const res = await addTask(text, { priority });
    if (res.ok) {
      setStatus({ kind: "success", id: res.id });
      setText("");
      setTimeout(() => setStatus({ kind: "idle" }), 2500);
    } else {
      setStatus({ kind: "error", message: res.error });
    }
  }

  const listening = status.kind === "listening";

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="เช่น &quot;เตือนไปดูพอร์ตตอน 4 โมง&quot; — หรือกดไมค์เพื่อพูด"
          rows={4}
          className="w-full resize-none bg-transparent outline-none text-sm leading-relaxed placeholder:text-zinc-400"
        />

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="text-xs px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium"
          >
            <option value="P0">🔴 ด่วนมาก</option>
            <option value="P1">🟠 สำคัญ</option>
            <option value="P2">🔵 ปกติ</option>
            <option value="P3">⚪ ทำได้ทำ</option>
          </select>

          <div className="ml-auto flex gap-2">
            {voiceSupported && (
              <button
                onClick={listening ? stopListening : startListening}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg active:scale-95 transition-transform ${
                  listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-zinc-200 dark:bg-zinc-800"
                }`}
                aria-label={listening ? "หยุด" : "พูด"}
              >
                🎤
              </button>
            )}
            <button
              onClick={submit}
              disabled={!text.trim() || status.kind === "submitting"}
              className="px-5 h-10 rounded-full bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 active:scale-95"
            >
              {status.kind === "submitting" ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </button>
          </div>
        </div>
      </div>

      {status.kind === "success" && (
        <div className="card p-3 border-green-300 dark:border-green-900 bg-green-50/60 dark:bg-green-950/30 text-sm text-green-700 dark:text-green-300">
          ✓ เพิ่มแล้ว · <span className="font-mono">{status.id}</span>
        </div>
      )}
      {status.kind === "error" && (
        <div className="card p-3 border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30 text-sm text-red-700 dark:text-red-300">
          ⚠ {status.message}
        </div>
      )}

      {!voiceSupported && (
        <p className="text-[11px] text-zinc-500 px-1">
          🎤 เบราว์เซอร์นี้ไม่รองรับการพูด — ใช้พิมพ์ได้
        </p>
      )}

      <div className="card p-3 bg-zinc-50 dark:bg-zinc-900/50">
        <p className="text-[11px] font-semibold mb-1.5">ทริค</p>
        <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1 leading-relaxed">
          <li>· พูดอะไรก็ได้ ทั้งภาษาไทย — แอพจะแปลงเป็นข้อความให้</li>
          <li>· เลือก priority ก่อนเพิ่ม</li>
          <li>· Task จะไปอยู่ใน /tasks ของวันนี้</li>
        </ul>
      </div>
    </div>
  );
}
