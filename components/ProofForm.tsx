"use client";

import { useState } from "react";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { isSolvent, isExcellentTier, toProfile } from "@/lib/contract";

type Tier = "excellent" | "solvent" | "insolvent";
type Result = { tier: Tier; ratio: number } | null;

export default function ProofForm({ walletApi }: { walletApi: ConnectedAPI }) {
  const [income, setIncome] = useState("");
  const [debt, setDebt] = useState("");
  const [defiAssets, setDefiAssets] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState<string | null>(null);

  function evaluate() {
    setError(null);

    const inc = Number(income);
    const dbt = Number(debt);
    const defi = Number(defiAssets);

    if (isNaN(inc) || isNaN(dbt) || isNaN(defi) || inc < 0 || dbt < 0 || defi < 0) {
      setError("Enter valid non-negative numbers.");
      return;
    }

    try {
      const profile = toProfile(inc, dbt, defi);
      const totalAssets = inc + defi;
      const ratio = dbt > 0 ? totalAssets / dbt : Infinity;

      let tier: Tier = "insolvent";
      if (isExcellentTier(profile)) tier = "excellent";
      else if (isSolvent(profile)) tier = "solvent";

      setResult({ tier, ratio });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    }
  }

  const tierLabel: Record<Tier, { text: string; color: string }> = {
    excellent: { text: "Excellent", color: "text-emerald-400" },
    solvent: { text: "Solvent", color: "text-yellow-400" },
    insolvent: { text: "Not Solvent", color: "text-red-400" },
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-white text-center">
        Private Financial Data
      </h2>
      <p className="text-xs text-zinc-500 text-center">
        This data stays on your device. It will never be sent anywhere.
      </p>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-400">Monthly Income</span>
        <input
          type="number"
          min="0"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="e.g. 5000"
          className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-400">Total Debt</span>
        <input
          type="number"
          min="0"
          value={debt}
          onChange={(e) => setDebt(e.target.value)}
          placeholder="e.g. 2000"
          className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-zinc-400">DeFi Assets</span>
        <input
          type="number"
          min="0"
          value={defiAssets}
          onChange={(e) => setDefiAssets(e.target.value)}
          placeholder="e.g. 3000"
          className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
      </label>

      <button
        onClick={evaluate}
        disabled={!income || !debt}
        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Verify Locally
      </button>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      {result && (
        <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-4 text-center">
          <p className={`text-lg font-bold ${tierLabel[result.tier].color}`}>
            {tierLabel[result.tier].text}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Asset-to-debt ratio:{" "}
            {result.ratio === Infinity ? "∞" : result.ratio.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-600 mt-2">
            Verified using compiled Compact circuit logic
          </p>
        </div>
      )}
    </div>
  );
}
