import type { LogEntry } from "@/hooks";

export default function LogsPanel({ logs }: { logs: LogEntry[] }) {
  return (
    <section className="flex min-h-0 flex-col border-b border-white/70 p-6 lg:border-b-0">
      <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
        <span>Crypto.Logs</span>
        <span className="h-px flex-1 bg-white/15" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">
            No events yet
          </p>
        ) : (
          <div className="space-y-0">
            {logs.map((log, i) => (
              <div
                key={`${log.time}-${i}`}
                className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-dashed border-white/10 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/55 last:border-b-0"
              >
                <span className="text-white/30">{log.time}</span>
                <span className="truncate">{log.label}</span>
                <span className={log.status === "fail" ? "text-red-400/70" : ""}>
                  [{log.status}]
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
