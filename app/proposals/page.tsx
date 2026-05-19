import { getPendingProposals, getDecisions, getAllAgents } from "@/lib/company";
import { listDir } from "@/lib/github";
import { formatTimeAgo } from "@/lib/labels";
import Avatar from "@/components/Avatar";
import { decideProposal } from "./actions";

export const revalidate = 60;

async function getPendingWithFilenames() {
  const files = await listDir("company/proposals");
  const proposals = await getPendingProposals();
  const map = new Map(proposals.map((p) => [p.id, p]));

  const withFn = files
    .filter((f) => f.type === "file" && f.name.endsWith(".json") && !f.name.startsWith("."))
    .map((f) => {
      const matched = Array.from(map.values()).find((p) =>
        f.name.includes(p.id)
      );
      return matched ? { proposal: matched, filename: f.name } : null;
    })
    .filter(Boolean) as { proposal: ReturnType<typeof getPendingProposals> extends Promise<(infer T)[]> ? T : never; filename: string }[];

  return withFn;
}

const CATEGORY_TH: Record<string, string> = {
  "new-routine": "Routine ใหม่",
  budget: "งบประมาณ",
  "new-agent": "พนักงานใหม่",
  policy: "นโยบาย",
  feature: "ฟีเจอร์",
};

export default async function ProposalsPage() {
  const [pending, decisions, agents] = await Promise.all([
    getPendingWithFilenames(),
    getDecisions(),
    getAllAgents(),
  ]);

  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));
  const recentDecisions = decisions.slice(0, 5);

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          คำขออนุมัติ
          {pending.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
              {pending.length} รอ
            </span>
          )}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          จากทีมงาน · คุณตัดสิน
        </p>
      </header>

      {pending.length === 0 && (
        <div className="m-4 p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm font-medium">ไม่มีคำขอค้าง</p>
          <p className="text-[11px] mt-1">ทีมทำงานเองได้สบาย</p>
        </div>
      )}

      <div className="px-4 py-4 space-y-3">
        {pending.map(({ proposal: p, filename }) => {
          const proposer = agentBySlug.get(p.proposed_by);
          const categoryLabel = CATEGORY_TH[p.category] ?? p.category;
          return (
            <article key={p.id} className="card overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
                {proposer && <Avatar emoji={proposer.emoji} size="md" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{proposer?.name ?? p.proposed_by}</p>
                  <p className="text-[11px] text-zinc-500">
                    {categoryLabel} · {formatTimeAgo(p.requested_at)}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-4 py-3">
                <h2 className="text-base font-bold leading-tight mb-2">
                  {p.title}
                </h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {p.rationale}
                </p>

                {p.estimated_cost_usd != null && p.estimated_cost_usd > 0 && (
                  <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">
                    💸 ค่าใช้จ่ายประเมิน ${p.estimated_cost_usd.toFixed(2)}
                  </p>
                )}

                {p.preview && (
                  <details className="mt-3">
                    <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer">
                      ดูรายละเอียดเพิ่มเติม
                    </summary>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed p-2 rounded bg-zinc-50 dark:bg-zinc-900/50">
                      {p.preview}
                    </p>
                  </details>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await decideProposal(filename, "approved");
                  }}
                  className="flex-1"
                >
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-sm active:scale-[0.98] transition-transform"
                  >
                    ✓ อนุมัติ
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await decideProposal(filename, "rejected");
                  }}
                  className="flex-1"
                >
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 font-semibold text-sm active:scale-[0.98] transition-transform"
                  >
                    ✗ ปฏิเสธ
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>

      {/* Recent decisions */}
      {recentDecisions.length > 0 && (
        <section className="px-4 pt-2 pb-8">
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
            ตัดสินไปแล้วล่าสุด
          </h2>
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {recentDecisions.map((d) => (
              <li key={d.id} className="px-4 py-3 flex items-center gap-2.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    d.status === "approved" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.title}</p>
                  <p className="text-[10px] text-zinc-500">
                    {d.status === "approved" ? "อนุมัติ" : "ปฏิเสธ"} ·{" "}
                    {d.decided_at ? formatTimeAgo(d.decided_at) : "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
