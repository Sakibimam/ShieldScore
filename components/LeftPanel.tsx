"use client";

import type { WalletState } from "@/hooks";
import type { FormData, ProofPhase, ProofResult } from "@/lib/types";
import ProofForm from "@/components/ProofForm";

const TIER_DISPLAY: Record<string, { label: string; color: string }> = {
  excellent: { label: "Excellent", color: "text-emerald-400" },
  solvent: { label: "Solvent", color: "text-yellow-400" },
  insolvent: { label: "Not Solvent", color: "text-red-400" },
};

export default function LeftPanel({
  wallet,
  phase,
  proof,
  onSubmit,
}: {
  wallet: WalletState;
  phase: ProofPhase;
  proof: ProofResult | null;
  onSubmit: (data: FormData) => void;
}) {
  const connected = !!wallet.api;

  return (
    <section className="flex min-h-0 flex-col border-b border-white/70 p-6 lg:row-span-2 lg:border-r lg:overflow-y-auto">
      <SectionLabel text="Entity.Target" />

      <h1 className="mt-1 text-3xl font-black uppercase tracking-tight">
        ShieldScore
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-white/50">
        Private solvency verification on Midnight.
        Financial data never leaves this device.
      </p>

      {/* ── Wallet card ── */}
      <div className="mt-6 border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : wallet.walletAvailable ? "bg-yellow-400/60" : "bg-white/25"}`} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              {connected ? "Wallet Linked" : wallet.walletAvailable ? "Lace Detected" : "No Wallet"}
            </span>
          </div>
          {connected && (
            <button
              onClick={wallet.disconnect}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-400/60 transition hover:text-red-400"
            >
              Disconnect
            </button>
          )}
        </div>

        {connected ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-white/60">
                {wallet.address}
              </code>
            </div>
            <div className="flex gap-3">
              <Tag label="preprod" color="emerald" />
              <Tag label="unshielded" />
              <Tag label="active" color="emerald" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {wallet.walletAvailable && (
              <p className="font-mono text-[10px] text-white/30">
                Midnight wallet extension detected in browser
              </p>
            )}
            <button
              onClick={wallet.connect}
              disabled={wallet.connecting}
              className="flex w-full items-center justify-between border border-white/25 px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              <span>{wallet.connecting ? "Connecting…" : "Link Wallet"}</span>
              {wallet.connecting ? (
                <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
              ) : (
                <span aria-hidden="true">→</span>
              )}
            </button>
          </div>
        )}

        {wallet.error && (
          <p className="mt-2 font-mono text-[10px] text-red-400/80">{wallet.error}</p>
        )}
      </div>

      {/* ── Proof form or placeholder ── */}
      <div className="mt-6 flex-1">
        {connected ? (
          <>
            <SectionLabel text="Proof.Input" />
            <div className="mt-3">
              <ProofForm phase={phase} onSubmit={onSubmit} />
            </div>
          </>
        ) : (
          <div className="border border-dashed border-white/10 p-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">
            Awaiting wallet to unlock verification
          </div>
        )}
      </div>

      {/* ── Result card ── */}
      {proof && (phase === "success" || phase === "fail") && (
        <div className="mt-6">
          <SectionLabel text="Result" />
          <div className={`border p-4 ${phase === "fail" ? "border-red-400/20 bg-red-400/[0.03]" : "border-emerald-400/20 bg-emerald-400/[0.03]"}`}>
            <div className="flex items-baseline justify-between">
              <span className={`text-lg font-bold ${TIER_DISPLAY[proof.tier]?.color ?? "text-white"}`}>
                {TIER_DISPLAY[proof.tier]?.label ?? proof.tier}
              </span>
              <span className="font-mono text-[11px] text-white/40">
                {proof.ratio === Infinity ? "∞" : proof.ratio.toFixed(2)}x
              </span>
            </div>
            <div className="mt-3 flex gap-3">
              <Tag label={phase === "success" ? "verified" : "rejected"} color={phase === "success" ? "emerald" : "red"} />
              <Tag label="local circuit" />
              <Tag label={proof.tier} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
      <span>{text}</span>
      <span className="h-px flex-1 bg-white/15" />
    </div>
  );
}

function Tag({ label, color }: { label: string; color?: "emerald" | "red" | "yellow" }) {
  const c = color === "emerald"
    ? "border-emerald-400/30 text-emerald-400/70"
    : color === "red"
      ? "border-red-400/30 text-red-400/70"
      : color === "yellow"
        ? "border-yellow-400/30 text-yellow-400/70"
        : "border-white/15 text-white/40";

  return (
    <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${c}`}>
      {label}
    </span>
  );
}
