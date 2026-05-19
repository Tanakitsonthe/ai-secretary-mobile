import { listDir, readFile } from "@/lib/github";

export type StreakInfo = {
  current: number;
  longest: number;
  total: number;
  last_date: string | null;
  dates: string[];
};

function bkkToday(): Date {
  const now = new Date();
  const offset = 7 * 60;
  return new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeStreak(dates: string[]): StreakInfo {
  if (dates.length === 0) {
    return { current: 0, longest: 0, total: 0, last_date: null, dates: [] };
  }
  const sorted = [...new Set(dates)].sort();
  const set = new Set(sorted);

  // Longest streak
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of sorted) {
    const day = new Date(d);
    if (prev) {
      const diff = (day.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) run += 1;
      else {
        longest = Math.max(longest, run);
        run = 1;
      }
    } else {
      run = 1;
    }
    prev = day;
  }
  longest = Math.max(longest, run);

  // Current streak (counting back from today or yesterday)
  const today = bkkToday();
  let current = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    if (set.has(dateKey(d))) {
      current += 1;
    } else if (i === 0) {
      continue; // allow skipping today
    } else {
      break;
    }
  }

  return {
    current,
    longest,
    total: sorted.length,
    last_date: sorted[sorted.length - 1],
    dates: sorted,
  };
}

async function listMdDates(dir: string): Promise<string[]> {
  try {
    const files = await listDir(dir);
    return files
      .filter((f) => f.type === "file" && f.name.endsWith(".md"))
      .map((f) => f.name.match(/^(\d{4}-\d{2}-\d{2})/)?.[1])
      .filter((d): d is string => !!d);
  } catch {
    return [];
  }
}

export async function getWorkoutStreak(): Promise<StreakInfo> {
  const dates = await listMdDates("fitness/workouts");
  return computeStreak(dates);
}

export async function getReflectionStreak(): Promise<StreakInfo> {
  const dates = await listMdDates("reflections");
  return computeStreak(dates);
}

export async function getBriefStreak(): Promise<StreakInfo> {
  const dates = await listMdDates("stocks/daily-news");
  return computeStreak(dates);
}

export type ReflectionData = {
  date: string;
  energy: number;
  mood: string;
};

export async function getReflectionHistory(): Promise<ReflectionData[]> {
  try {
    const files = await listDir("reflections");
    const mdFiles = files.filter(
      (f) => f.type === "file" && f.name.endsWith(".md")
    );
    const data = await Promise.all(
      mdFiles.map(async (f): Promise<ReflectionData | null> => {
        try {
          const content = await readFile(f.path);
          const fm = content.match(/^---\n([\s\S]*?)\n---/);
          if (!fm) return null;
          const energyMatch = fm[1].match(/energy:\s*(\d+)/);
          const moodMatch = fm[1].match(/mood:\s*(\S+)/);
          const dateMatch = fm[1].match(/date:\s*(\S+)/) ?? f.name.match(/^(\d{4}-\d{2}-\d{2})/);
          if (!energyMatch || !dateMatch) return null;
          return {
            date: dateMatch[1],
            energy: parseInt(energyMatch[1], 10),
            mood: moodMatch?.[1] ?? "neutral",
          };
        } catch {
          return null;
        }
      })
    );
    return data
      .filter((d): d is ReflectionData => d !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}
