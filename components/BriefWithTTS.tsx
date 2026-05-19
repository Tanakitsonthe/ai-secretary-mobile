"use client";

import { useState, useEffect } from "react";
import MarkdownView from "./MarkdownView";

export default function BriefWithTTS({ content }: { content: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  function strip(md: string): string {
    return md
      .replace(/```[\s\S]*?```/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[#*_`>~|-]+/g, " ")
      .replace(/---[\s\S]*?---/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function start() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const text = strip(content);
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "th-TH";
    utter.rate = 1.05;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }
  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <div className="relative">
      {supported && (
        <button
          onClick={speaking ? stop : start}
          className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          aria-label={speaking ? "หยุดอ่าน" : "ฟังเสียง"}
        >
          {speaking ? "⏸️" : "🔊"}
        </button>
      )}
      <MarkdownView content={content} />
    </div>
  );
}
