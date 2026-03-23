"use client";

import { useCallback } from "react";
import { useMidnightWallet, useProofLifecycle, useLogs } from "@/hooks";
import { isSolvent, isExcellentTier, toProfile } from "@/lib/contract";
import type { FormData, ProofResult } from "@/lib/types";
import Header from "@/components/Header";
import LeftPanel from "@/components/LeftPanel";
import LogsPanel from "@/components/LogsPanel";
import RightPanel from "@/components/RightPanel";
import SystemFrame from "@/components/SystemFrame";

export default function Home() {
  const logs = useLogs();

  const wallet = useMidnightWallet({
    onConnect: () => logs.push("wallet_connected"),
    onDisconnect: () => logs.push("wallet_disconnected"),
    onError: (msg) => logs.push(msg, "fail"),
  });

  const proof = useProofLifecycle({
    onPhase: (_phase, label) => {
      const status = label.includes("fail") || label.includes("error") ? "fail" : label.includes("start") || label.includes("init") ? "..." : "ok";
      logs.push(label, status);
    },
  });

  const handleSubmit = useCallback(
    (data: FormData) => {
      proof.execute(() => {
        const profile = toProfile(data.income, data.debt, data.defiAssets);
        const totalAssets = data.income + data.defiAssets;
        const ratio = data.debt > 0 ? totalAssets / data.debt : Infinity;

        let tier: ProofResult["tier"] = "insolvent";
        if (isExcellentTier(profile)) tier = "excellent";
        else if (isSolvent(profile)) tier = "solvent";

        return { tier, ratio };
      });
    },
    [proof],
  );

  return (
    <SystemFrame header={<Header connected={!!wallet.api} phase={proof.phase} />}>
      <LeftPanel
        wallet={wallet}
        phase={proof.phase}
        proof={proof.result}
        onSubmit={handleSubmit}
      />

      <RightPanel connected={!!wallet.api} phase={proof.phase} proof={proof.result} />

      <LogsPanel logs={logs.entries} />

      <section className="grid grid-cols-1 border-white/70 sm:grid-cols-2 lg:col-span-2 lg:border-t">
        <MetricCell
          label="Verification Tier"
          value={proof.result ? proof.result.tier.toUpperCase() : "—"}
          className="border-b border-white/70 sm:border-b-0 sm:border-r"
        />
        <MetricCell
          label="Asset / Debt Ratio"
          value={
            proof.result
              ? proof.result.ratio === Infinity
                ? "∞"
                : `${proof.result.ratio.toFixed(1)}x`
              : "—"
          }
        />
      </section>
    </SystemFrame>
  );
}

function MetricCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between p-6 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </span>
      <span className="text-2xl font-black uppercase tracking-tight">
        {value}
      </span>
    </div>
  );
}
