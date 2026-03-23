import type { ProofPhase } from "@/lib/types";

const PHASE_TAG: Record<ProofPhase, { label: string; color: string }> = {
  idle: { label: "proof.idle", color: "text-white/40" },
  generating: { label: "proof.generating", color: "text-yellow-400/80 animate-pulse" },
  verifying: { label: "proof.verifying", color: "text-yellow-400/80 animate-pulse" },
  success: { label: "proof.verified", color: "text-emerald-400/80" },
  fail: { label: "proof.failed", color: "text-red-400/80" },
};

export default function Header({
  connected,
  phase,
  address,
}: {
  connected: boolean;
  phase: ProofPhase;
  address: string | null;
}) {
  const tag = PHASE_TAG[phase];

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-white/70 px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 md:px-6">
      <span className="flex items-center gap-2">
        <ShieldIcon />
        shieldscore
      </span>

      <span className={tag.color}>{tag.label}</span>

      <span className="flex items-center gap-2">
        {connected && address && (
          <span className="hidden text-white/30 sm:inline">
            {address.slice(0, 12)}…
          </span>
        )}
        <span className={`flex items-center gap-1.5 ${connected ? "text-emerald-400/70" : ""}`}>
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-white/30"}`} />
          {connected ? "preprod" : "offline"}
        </span>
      </span>
    </header>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      className="inline-block"
      aria-hidden="true"
    >
      <path
        d="M7 0L0 3v5c0 4.17 2.99 8.06 7 9 4.01-.94 7-4.83 7-9V3L7 0z"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <path
        d="M7 2l1.5 3h3.2L8.8 7.5l1 3.2L7 8.8l-2.8 1.9 1-3.2L2.3 5h3.2L7 2z"
        fill="black"
        fillOpacity="0.4"
      />
    </svg>
  );
}
