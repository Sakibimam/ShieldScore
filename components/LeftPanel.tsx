"use client";

import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { FormData, ProofPhase, ProofResult } from "@/lib/types";
import ProofForm from "@/components/ProofForm";
import WalletConnect from "@/components/WalletConnect";

const TIER_COLOR: Record<string, string> = {
  excellent: "text-emerald-400",
  solvent: "text-yellow-400",
  insolvent: "text-red-400",
};

export default function LeftPanel({
  walletApi,
  phase,
  proof,
  onConnect,
  onSubmit,
}: {
  walletApi: ConnectedAPI | null;
  phase: ProofPhase;
  proof: ProofResult | null;
  onConnect: (api: ConnectedAPI) => void;
  onSubmit: (data: FormData) => void;
}) {
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

      <div className="mt-6 border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${walletApi ? "bg-emerald-400" : "bg-white/25"}`}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            {walletApi ? "Wallet Linked" : "No Wallet"}
          </span>
        </div>
        <WalletConnect onConnect={(_addr, api) => onConnect(api)} />
      </div>

      <div className="mt-6 flex-1">
        {walletApi ? (
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

      {proof && (phase === "success" || phase === "fail") && (
        <div className="mt-6">
          <SectionLabel text="Result" />
          <div className="border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-lg font-bold ${TIER_COLOR[proof.tier] ?? "text-white"}`}>
                {proof.tier === "excellent" ? "Excellent" : proof.tier === "solvent" ? "Solvent" : "Not Solvent"}
              </span>
              <span className="font-mono text-[11px] text-white/40">
                {proof.ratio === Infinity ? "∞" : proof.ratio.toFixed(2)}x
              </span>
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
              {phase === "success" ? "Circuit verified" : "Verification rejected"}
            </p>
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
