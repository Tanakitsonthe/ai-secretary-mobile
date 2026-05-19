import ReflectForm from "./ReflectForm";
import { readFile, todayBkkDate } from "@/lib/github";

export const revalidate = 60;

async function getTodayReflection() {
  const today = todayBkkDate();
  try {
    return await readFile(`reflections/${today}.md`);
  } catch {
    return null;
  }
}

export default async function ReflectPage() {
  const today = todayBkkDate();
  const existing = await getTodayReflection();

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">📝 Reflection · {today}</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          คิดทบทวนวันนี้ก่อนนอน (3 นาที)
        </p>
      </header>

      <div className="px-4 py-4">
        {existing && (
          <div className="card p-3 mb-4 border-green-300 dark:border-green-900 bg-green-50/60 dark:bg-green-950/30 text-sm">
            <p className="font-semibold text-green-700 dark:text-green-300">
              ✓ บันทึกแล้วสำหรับวันนี้
            </p>
            <p className="text-[11px] text-green-600 dark:text-green-400 mt-1">
              เขียนใหม่จะทับของเดิม
            </p>
          </div>
        )}
        <ReflectForm />
      </div>
    </div>
  );
}
