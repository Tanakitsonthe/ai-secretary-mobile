"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function OnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/onboarding") return;
    try {
      const seen = localStorage.getItem("nut_onboarded");
      if (!seen && pathname === "/") {
        router.replace("/onboarding");
      }
    } catch {}
  }, [pathname, router]);

  return null;
}
