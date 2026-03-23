"use client";

import { useEffect, useState } from "react";
import type { ProofPhase, ProofResult } from "@/lib/types";

const NODES = [
  { x: "8%", y: "8%", label: "Validator", hollow: true },
  { x: "45%", y: "14%", label: "Prover", hollow: false },
  { x: "78%", y: "20%", label: "Oracle", hollow: true },
  { x: "15%", y: "65%", label: "Contract", hollow: true },
  { x: "72%", y: "60%", label: "Registry", hollow: false },
  { x: "45%", y: "82%", label: "Finality", hollow: false },
] as const;

const EDGES = [
  { x1: "12%", y1: "15%", rotate: 18 },
  { x1: "70%", y1: "18%", rotate: -30 },
  { x1: "15%", y1: "72%", rotate: -10 },
  { x1: "68%", y1: "68%", rotate: 28 },
] as const;

function activeSetForPhase(phase: ProofPhase, tick: number): Set<number> {
  if (phase === "generating") return new Set(Array.from({ length: Math.min(tick + 1, 3) }, (_, i) => i));
  if (phase === "verifying") return new Set([0, 1, 2, ...Array.from({ length: Math.min(tick + 1, 3) }, (_, i) => i + 3)]);
  if (phase === "success") return new Set([0, 1, 2, 3, 4, 5]);
  return new Set();
}

const PHASE_LABEL: Record<ProofPhase, string> = {
  idle: "Awaiting input",
  generating: "Generating proof…",
  verifying: "Verifying circuit…",
  success: "Verification complete",
  fail: "Verification failed",
};

export default function RightPanel({
  connected,
  phase,
  proof,
}: {
  connected: boolean;
  phase: ProofPhase;
  proof: ProofResult | null;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (phase !== "generating" && phase !== "verifying") {
      setTick(0);
      return;
    }
    setTick(0);
    const id = setInterval(() => setTick((t) => t + 1), 350);
    return () => clearInterval(id);
  }, [phase]);

  const active = activeSetForPhase(phase, tick);
  const busy = phase === "generating" || phase === "verifying";

  return (
    <section className="relative flex min-h-[400px] flex-col overflow-hidden border-b border-white/70 p-6 lg:row-span-2 lg:border-r">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
          <span>Proof.Network</span>
          <span className="h-px w-12 bg-white/15" />
        </div>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
            busy
              ? "animate-pulse text-yellow-400/70"
              : connected
                ? "text-emerald-400/70"
                : "text-white/30"
          }`}
        >
          {busy ? "Processing" : connected ? "Live" : "Offline"}
        </span>
      </div>

      <div className="relative flex-1 rounded-xl border border-white/8 bg-white/[0.015]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_65%)]" />

        <div className="absolute inset-x-[10%] top-1/2 h-px bg-white/8" />
        <div className="absolute inset-y-[10%] left-1/2 w-px bg-white/8" />

        {EDGES.map((e, i) => (
          <div
            key={i}
            className={`absolute h-px w-[18%] transition-colors duration-500 ${
              busy ? "bg-white/40" : "bg-white/20"
            }`}
            style={{ left: e.x1, top: e.y1, transform: `rotate(${e.rotate}deg)` }}
          />
        ))}

        {NODES.map((node, i) => {
          const lit = active.has(i);
          const failed = phase === "fail";
          return (
            <div
              key={node.label}
              className="absolute flex flex-col items-start gap-2 transition-opacity duration-300"
              style={{ left: node.x, top: node.y, opacity: lit || phase === "idle" || phase === "success" || failed ? 1 : 0.3 }}
            >
              <span
                className={`block h-3 w-3 rounded-full border-2 transition-all duration-300 ${
                  failed
                    ? "border-red-400/60 bg-red-400/20"
                    : lit
                      ? "border-emerald-400 bg-emerald-400"
                      : node.hollow
                        ? "border-white/40 bg-transparent"
                        : "border-white/60 bg-white/60"
                }`}
              />
              <span
                className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                  failed
                    ? "border-red-400/20 bg-black/70 text-red-400/50"
                    : lit
                      ? "border-emerald-400/30 bg-black/70 text-emerald-400/70"
                      : "border-white/10 bg-black/70 text-white/45"
                }`}
              >
                {node.label}
              </span>
            </div>
          );
        })}

        {(phase === "success" || phase === "fail") && proof && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p
              className={`text-5xl font-black uppercase tracking-tight ${
                phase === "fail" ? "text-red-400/20" : "text-white/15"
              }`}
            >
              {proof.tier === "excellent" ? "A+" : proof.tier === "solvent" ? "OK" : "✗"}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
          {connected ? PHASE_LABEL[phase] : "Connect wallet to activate verification surface"}
        </p>
      </div>
    </section>
  );
}
