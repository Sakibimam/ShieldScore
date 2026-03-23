"use client";

import { useState } from "react";
import type { FormData, ProofPhase } from "@/lib/types";

export default function ProofForm({
  phase,
  onSubmit,
}: {
  phase: ProofPhase;
  onSubmit: (data: FormData) => void;
}) {
  const [income, setIncome] = useState("");
  const [debt, setDebt] = useState("");
  const [defiAssets, setDefiAssets] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = phase === "generating" || phase === "verifying";

  function handleSubmit() {
    setError(null);

    const inc = Number(income);
    const dbt = Number(debt);
    const defi = Number(defiAssets);

    if ([inc, dbt, defi].some((v) => isNaN(v) || v < 0)) {
      setError("Enter valid non-negative numbers.");
      return;
    }

    onSubmit({ income: inc, debt: dbt, defiAssets: defi });
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Field label="Monthly Income" value={income} onChange={setIncome} placeholder="5000" disabled={busy} />
      <Field label="Total Debt" value={debt} onChange={setDebt} placeholder="2000" disabled={busy} />
      <Field label="DeFi Assets" value={defiAssets} onChange={setDefiAssets} placeholder="3000" disabled={busy} />

      <button
        onClick={handleSubmit}
        disabled={!income || !debt || busy}
        className="mt-1 flex w-full items-center justify-between border border-white/25 px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white"
      >
        <span>
          {busy ? (phase === "generating" ? "Generating…" : "Verifying…") : "Generate Proof"}
        </span>
        {busy ? (
          <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
        ) : (
          <span aria-hidden="true">→</span>
        )}
      </button>

      {error && <p className="font-mono text-[10px] text-red-400/80">{error}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
        {label}
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-white/15 bg-transparent px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-white/40 focus:outline-none disabled:opacity-40"
      />
    </label>
  );
}
