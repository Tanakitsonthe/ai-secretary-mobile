// Thai labels for technical codes — used across PWA to hide "code language"

import type { Priority, AgentStatus, TaskStatus } from "@/lib/company";

export const PRIORITY_TH: Record<Priority, string> = {
  P0: "ด่วนมาก",
  P1: "สำคัญ",
  P2: "ปกติ",
  P3: "ทำได้ทำ",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  P0: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-900",
  P1: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-900",
  P2: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900",
  P3: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
};

export const PRIORITY_DOT: Record<Priority, string> = {
  P0: "bg-red-500",
  P1: "bg-orange-500",
  P2: "bg-blue-500",
  P3: "bg-zinc-400",
};

export const AGENT_STATUS_TH: Record<AgentStatus, string> = {
  idle: "ว่าง",
  working: "ทำงาน",
  blocked: "ติด",
  offline: "ออฟไลน์",
};

export const AGENT_STATUS_DOT: Record<AgentStatus, string> = {
  idle: "bg-zinc-400",
  working: "bg-green-500",
  blocked: "bg-amber-500",
  offline: "bg-zinc-300 dark:bg-zinc-700",
};

export const TASK_STATUS_TH: Record<TaskStatus, string> = {
  todo: "รอทำ",
  doing: "กำลังทำ",
  done: "เสร็จแล้ว",
  blocked: "ติด",
  cancelled: "ยกเลิก",
};

export const TASK_STATUS_ICON: Record<TaskStatus, string> = {
  todo: "⏳",
  doing: "▶️",
  done: "✅",
  blocked: "🚧",
  cancelled: "✖",
};

export const TASK_STATUS_ORDER: Record<TaskStatus, number> = {
  doing: 0,
  todo: 1,
  blocked: 2,
  done: 3,
  cancelled: 4,
};

export const EVENT_TH: Record<string, { label: string; icon: string }> = {
  task_start: { label: "เริ่มทำงาน", icon: "▶️" },
  task_done: { label: "เสร็จงาน", icon: "✅" },
  task_blocked: { label: "งานติด", icon: "🚧" },
  task_cancelled: { label: "ยกเลิกงาน", icon: "✖" },
  milestone: { label: "จุดสำคัญ", icon: "🎯" },
  report_refreshed: { label: "อัพเดทรายงาน", icon: "🔄" },
  refresh_skipped: { label: "ข้าม (ของเก่ายังสด)", icon: "⏭️" },
  weekly_proposed: { label: "เสนอโปรเจกต์ใหม่", icon: "💡" },
  workout_generated: { label: "สร้าง workout วันนี้", icon: "🏋️" },
  push_sent: { label: "ส่งแจ้งเตือน", icon: "🔔" },
  approved: { label: "อนุมัติ", icon: "✓" },
  rejected: { label: "ปฏิเสธ", icon: "✗" },
};

export const DEPARTMENT_TH: Record<string, string> = {
  health: "สุขภาพ",
  education: "เรียนรู้",
  finance: "การเงิน",
  personal: "ส่วนตัว",
  career: "อาชีพ",
  engineering: "วิศวกรรม",
  quality: "ตรวจสอบ",
};

export const SKILL_TH: Record<string, string> = {
  "workout-planning": "วางแผนออกกำลังกาย",
  nutrition: "โภชนาการ",
  "progress-tracking": "ติดตามความคืบหน้า",
  "form-correction": "แก้ฟอร์ม",
  "interactive-qa": "ถาม-ตอบสด",
  "writing-correction": "ตรวจการเขียน",
  "vocab-building": "สร้างคลังศัพท์",
  "tech-english": "อังกฤษสาย IT",
  "html-css-js": "HTML/CSS/JS",
  react: "React",
  nextjs: "Next.js",
  git: "Git",
  "code-review": "ตรวจโค้ด",
  debugging: "หาบัก",
  "market-basics": "พื้นฐานตลาด",
  "trading-mechanics": "กลไกการเทรด",
  fundamentals: "ปัจจัยพื้นฐาน",
  "thai-explanation": "อธิบายเป็นไทย",
  "btc-eth-basics": "พื้นฐาน BTC/ETH",
  "exchanges-th": "Exchange ในไทย",
  wallets: "Wallet",
  security: "ความปลอดภัย",
  "thai-tax": "ภาษีไทย",
  "fundamental-research": "วิจัยปัจจัยพื้นฐาน",
  "news-synthesis": "สรุปข่าว",
  "thai-reports": "รายงานไทย",
  "sources-cited": "อ้างอิงครบ",
  "news-curation": "คัดข่าว",
  "task-aggregation": "รวบงาน",
  "thai-summary": "สรุปไทย",
  calendar: "ปฏิทิน",
  "weekly-planning": "วางแผนรายสัปดาห์",
  "habit-design": "ออกแบบนิสัย",
  "energy-management": "จัดการพลังงาน",
  reflection: "ทบทวน",
  "prep-planning": "วางแผนเตรียมตัว",
  interview: "สัมภาษณ์",
  onboarding: "เริ่มงาน",
  "soft-skills": "Soft skills",
  "daily-logs": "บันทึกประจำวัน",
  architecture: "สถาปัตยกรรม",
  planning: "วางแผน",
  implementation: "ลงมือทำ",
  "weekly-mini-project": "มินิโปรเจกต์รายสัปดาห์",
  typography: "พิมพ์",
  "visual-hierarchy": "ลำดับสายตา",
  "anti-ai-style": "ไม่ให้ดูเหมือน AI",
  "content-polishing": "ขัดเนื้อหา",
  "fact-verification": "ตรวจข้อเท็จจริง",
  "citation-quality": "คุณภาพอ้างอิง",
  "clarity-review": "ตรวจความชัด",
  "approve-or-revise": "อนุมัติหรือแก้",
};

export function formatTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return "เมื่อกี้";
  if (diffMin < 60) return `${diffMin} นาทีก่อน`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ชม.ก่อน`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} วันก่อน`;
  return iso.slice(0, 10);
}
