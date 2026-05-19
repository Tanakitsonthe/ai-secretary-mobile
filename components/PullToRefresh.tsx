"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PullToRefresh() {
  const router = useRouter();
  const [pulling, setPulling] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let startY = 0;
    let currentPull = 0;
    let active = false;
    const THRESHOLD = 80;

    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) {
        active = false;
        return;
      }
      startY = e.touches[0].clientY;
      active = true;
    }
    function onTouchMove(e: TouchEvent) {
      if (!active) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        currentPull = Math.min(dy * 0.5, 120);
        setPulling(currentPull);
      }
    }
    function onTouchEnd() {
      if (!active) return;
      active = false;
      if (currentPull >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        setPulling(60);
        router.refresh();
        setTimeout(() => {
          setRefreshing(false);
          setPulling(0);
        }, 900);
      } else {
        setPulling(0);
      }
      currentPull = 0;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [router, refreshing]);

  if (pulling === 0 && !refreshing) return null;

  const rotation = (pulling / 80) * 360;
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none transition-transform"
      style={{ transform: `translateY(${pulling - 40}px)` }}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-full w-10 h-10 shadow-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
        <span
          className="text-base"
          style={{
            transform: refreshing ? "" : `rotate(${rotation}deg)`,
            animation: refreshing ? "spin 1s linear infinite" : "",
          }}
        >
          🔄
        </span>
      </div>
    </div>
  );
}
