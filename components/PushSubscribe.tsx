"use client";

import { useState, useEffect } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type SubState = "idle" | "unsupported" | "denied" | "subscribed" | "loading" | "error";

export default function PushSubscribe() {
  const [state, setState] = useState<SubState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      if (sub) setState("subscribed");
    });
  }, []);

  async function subscribe() {
    setState("loading");
    setError(null);
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("VAPID public key not set in env");
      }

      const reg =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.register("/sw.js"));

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }

      const key = urlBase64ToUint8Array(publicKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key.buffer.slice(
          key.byteOffset,
          key.byteOffset + key.byteLength
        ) as ArrayBuffer,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      if (!res.ok) throw new Error(`Server: ${await res.text()}`);
      setState("subscribed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setState("error");
    }
  }

  async function unsubscribe() {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", { method: "DELETE" });
      }
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setState("error");
    }
  }

  async function testPush() {
    setError(null);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "🔔 Test from AI Secretary",
          body: "ระบบ push notification ใช้ได้แล้ว!",
          url: "/",
        }),
      });
      if (!res.ok) throw new Error(`Server: ${await res.text()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  if (state === "unsupported") {
    return (
      <div className="card p-3 text-xs text-zinc-500">
        เบราว์เซอร์นี้ไม่รองรับ push notification
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="card p-3 text-xs text-red-600 dark:text-red-400">
        ⛔ การแจ้งเตือนถูกบล็อก — ไปที่ Settings ของเบราว์เซอร์เพื่อเปิดอีกครั้ง
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Push Notifications</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {state === "subscribed"
              ? "เปิดใช้งาน · agents จะส่งแจ้งเตือนเข้ามือถือ"
              : "ให้ agents เด้งเตือนเข้ามือถือ"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {state === "subscribed" ? (
          <>
            <button
              onClick={testPush}
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm"
            >
              ทดสอบส่ง
            </button>
            <button
              onClick={unsubscribe}
              className="flex-1 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 font-semibold text-sm"
            >
              ปิด
            </button>
          </>
        ) : (
          <button
            onClick={subscribe}
            disabled={state === "loading"}
            className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-50"
          >
            {state === "loading" ? "กำลังเปิด..." : "เปิดการแจ้งเตือน"}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
