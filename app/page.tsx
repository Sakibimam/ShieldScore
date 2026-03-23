"use client";

import { useCallback, useRef, useState } from "react";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { LogEntry } from "@/components/LogsPanel";
import type { FormData, ProofPhase, ProofResult } from "@/lib/types";
import { isSolvent, isExcellentTier, toProfile } from "@/lib/contract";
import Header from "@/components/Header";
import LeftPanel from "@/components/LeftPanel";
import LogsPanel from "@/components/LogsPanel";
import RightPanel from "@/components/RightPanel";
import SystemFrame from "@/components/SystemFrame";

function ts() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function Home() {
  const [walletApi, setWalletApi] = useState<ConnectedAPI | null>(null);
  const [phase, setPhase] = useState<ProofPhase>("idle");
  const [proof, setProof] = useState<ProofResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const running = useRef(false);

  const push = useCallback((label: string, status: LogEntry["status"] = "ok") => {
    setLogs((prev) => [{ time: ts(), label, status }, ...prev]);
  }, []);

  const handleConnect = useCallback(
    (api: ConnectedAPI) => {
      setWalletApi(api);
      push("wallet_connected");
    },
    [push],
  );

  const handleSubmit = useCallback(
    async (data: FormData) => {
      if (running.current) return;
      running.current = true;
      setProof(null);

      try {
        setPhase("generating");
        push("init_circuit_gen", "...");
        await wait(700);

        push("profile_encoded");
        await wait(500);

        push("circuit_compiled");
        setPhase("verifying");
        await wait(600);

        push("zk_verify_start", "...");
        await wait(500);

        const profile = toProfile(data.income, data.debt, data.defiAssets);
        const totalAssets = data.income + data.defiAssets;
        const ratio = data.debt > 0 ? totalAssets / data.debt : Infinity;

        let tier: ProofResult["tier"] = "insolvent";
        if (isExcellentTier(profile)) tier = "excellent";
        else if (isSolvent(profile)) tier = "solvent";

        const result: ProofResult = { tier, ratio };
        setProof(result);

        if (tier === "insolvent") {
          push("verify_fail", "fail");
          setPhase("fail");
        } else {
          push(`verify_${tier}`);
          setPhase("success");
        }
      } catch {
        push("circuit_error", "fail");
        setPhase("fail");
      } finally {
        running.current = false;
      }
    },
    [push],
  );

  const connected = walletApi !== null;

  return (
    <SystemFrame header={<Header connected={connected} phase={phase} />}>
      <LeftPanel
        walletApi={walletApi}
        phase={phase}
        proof={proof}
        onConnect={handleConnect}
        onSubmit={handleSubmit}
      />

      <RightPanel connected={connected} phase={phase} proof={proof} />

      <LogsPanel logs={logs} />

      <section className="grid grid-cols-1 border-white/70 sm:grid-cols-2 lg:col-span-2 lg:border-t">
        <MetricCell
          label="Verification Tier"
          value={proof ? proof.tier.toUpperCase() : "—"}
          className="border-b border-white/70 sm:border-b-0 sm:border-r"
        />
        <MetricCell
          label="Asset / Debt Ratio"
          value={
            proof
              ? proof.ratio === Infinity
                ? "∞"
                : `${proof.ratio.toFixed(1)}x`
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
