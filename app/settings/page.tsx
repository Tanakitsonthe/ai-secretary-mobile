import PushSubscribe from "@/components/PushSubscribe";
import { getCEOProfile } from "@/lib/company";

export const revalidate = 300;

export default async function SettingsPage() {
  const profile = await getCEOProfile();

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">⚙️ Settings</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          การตั้งค่า PWA + Push
        </p>
      </header>

      <div className="px-4 py-4 space-y-4">
        <section>
          <h2 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
            Notifications
          </h2>
          <PushSubscribe />
          <p className="text-[11px] text-zinc-500 mt-2 px-1 leading-relaxed">
            ต้องอนุญาตการแจ้งเตือนเมื่อเปิดครั้งแรก
            <br />
            agents จะ push เมื่อมีงานใหม่ / ข่าวสำคัญ / proposal รออนุมัติ
          </p>
        </section>

        {profile && (
          <section>
            <h2 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
              CEO Profile
            </h2>
            <div className="card p-4 space-y-2 text-sm">
              <Row label="ชื่อ" value={`${profile.name} (${profile.nickname})`} />
              <Row label="Email" value={profile.email} />
              <Row label="Timezone" value={profile.timezone} />
              <Row label="โปรแกรม" value={profile.education.program} />
              <Row label="Focus" value={profile.current_focus_areas.join(", ")} />
            </div>
          </section>
        )}

        <p className="text-[10px] text-center text-zinc-400 py-4">
          แก้ profile ที่ company/ceo_profile.json ใน AI-Secretary repo
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-zinc-500 dark:text-zinc-400 shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
