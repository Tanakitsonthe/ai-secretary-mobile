import type { Task } from "@/lib/company";

const PRIORITY_WEIGHT: Record<string, number> = {
  P0: 100,
  P1: 60,
  P2: 30,
  P3: 10,
};

export type Suggestion = {
  task: Task;
  score: number;
  reason: string;
};

function bkkHour(): number {
  const now = new Date();
  const offset = 7 * 60;
  const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return local.getHours();
}

export function suggestNext(tasks: Task[]): Suggestion | null {
  const active = tasks.filter(
    (t) => t.status === "todo" || t.status === "doing"
  );
  if (active.length === 0) return null;

  const hour = bkkHour();
  // Categorize hour: morning (6-11), afternoon (12-17), evening (18-22), night (23-5)
  const timeBucket =
    hour >= 6 && hour <= 11
      ? "morning"
      : hour >= 12 && hour <= 17
      ? "afternoon"
      : hour >= 18 && hour <= 22
      ? "evening"
      : "night";

  // Prefer "doing" first
  const scored = active.map((t) => {
    let score = PRIORITY_WEIGHT[t.priority] ?? 0;
    const reasons: string[] = [];

    if (t.status === "doing") {
      score += 50;
      reasons.push("เริ่มไว้แล้ว ต่อให้จบ");
    }

    if (t.priority === "P0") reasons.push("ด่วนมาก");
    else if (t.priority === "P1") reasons.push("สำคัญ");

    // OKR-linked = +20
    if (t.okr_id) {
      score += 20;
      reasons.push("ตรงเป้าหมายปี");
    }

    // Deadline today = +30
    if (t.deadline) {
      const d = new Date(t.deadline);
      const hoursLeft = (d.getTime() - Date.now()) / 3600000;
      if (hoursLeft <= 6 && hoursLeft > 0) {
        score += 30;
        reasons.push("ใกล้เดดไลน์");
      }
    }

    // Time-of-day rules
    const title = t.title.toLowerCase();
    if (timeBucket === "morning") {
      // Learning + creative
      if (/(lesson|เรียน|learn|study|read|อ่าน|brief|วิจัย|research)/i.test(title)) {
        score += 25;
        reasons.push("เช้านี้สมองสด");
      }
      if (/(workout|ออกกำลัง|fitness|วิ่ง|run)/i.test(title)) {
        score += 30;
        reasons.push("เช้าเหมาะออกกำลัง");
      }
    } else if (timeBucket === "afternoon") {
      // Execution-heavy
      if (/(build|สร้าง|code|เขียน|implement|deploy|push)/i.test(title)) {
        score += 25;
        reasons.push("บ่ายเหมาะลงมือทำ");
      }
    } else if (timeBucket === "evening") {
      // Light + review
      if (/(review|ทบทวน|reflect|วางแผน|plan|chat|คุย)/i.test(title)) {
        score += 25;
        reasons.push("เย็นเหมาะทบทวน");
      }
      if (/(workout|ออกกำลัง|fitness)/i.test(title)) {
        score += 15;
        reasons.push("เย็นออกกำลังได้");
      }
    } else {
      // Night — light only
      if (/(reflect|ทบทวน|reading|อ่าน|brief)/i.test(title)) {
        score += 15;
        reasons.push("กลางคืนเหมาะเบาๆ");
      } else {
        score -= 15;
      }
    }

    // Estimated minutes fit
    const minutesToSleep = (22 - hour) * 60;
    if (t.estimated_minutes && minutesToSleep > 0) {
      if (t.estimated_minutes <= minutesToSleep) {
        score += 10;
      } else {
        score -= 10;
        reasons.push("งานยาว ระวังนอนดึก");
      }
    }

    return {
      task: t,
      score,
      reason: reasons.slice(0, 2).join(" · ") || "ลำดับถัดไป",
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}
