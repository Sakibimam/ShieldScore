"use client";

import { useCallback, useRef, useState } from "react";
import type { ProofPhase, ProofResult } from "@/lib/types";

export type ProofLifecycle = {
  /** Current phase of the proof pipeline */
  phase: ProofPhase;
  /** The result after success (null while idle/in-progress) */
  result: ProofResult | null;
  /** Human-readable error from the last failure */
  error: string | null;
  /** True while generating or verifying */
  busy: boolean;
  /** Kick off the proof lifecycle with a verifier function */
  execute: (verifier: () => ProofResult | Promise<ProofResult>) => Promise<void>;
  /** Reset back to idle */
  reset: () => void;
};

type PhaseCallback = (phase: ProofPhase, label: string) => void;

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/**
 * React hook for proof generation lifecycle.
 *
 * Drives a state machine through idle → generating → verifying → success/fail,
 * emitting phase callbacks at each transition (ideal for logging).
 *
 * The `execute` function accepts a verifier — any sync or async function that
 * returns a `ProofResult`. Today that's a local pure circuit call; when you
 * wire on-chain proving, swap in the async version with no API change.
 *
 * ```tsx
 * const proof = useProofLifecycle({ onPhase: (p, label) => pushLog(label) });
 * proof.execute(() => localVerify(data));
 * ```
 */
export function useProofLifecycle(
  opts: {
    /** Called at every phase transition with (phase, humanLabel) */
    onPhase?: PhaseCallback;
    /** Delay per step in ms — controls animation pacing */
    stepMs?: number;
  } = {},
): ProofLifecycle {
  const stepMs = opts.stepMs ?? 550;

  const [phase, setPhase] = useState<ProofPhase>("idle");
  const [result, setResult] = useState<ProofResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  function emit(p: ProofPhase, label: string) {
    setPhase(p);
    optsRef.current.onPhase?.(p, label);
  }

  const execute = useCallback(
    async (verifier: () => ProofResult | Promise<ProofResult>) => {
      if (running.current) return;
      running.current = true;
      setResult(null);
      setError(null);

      try {
        emit("generating", "init_circuit_gen");
        await wait(stepMs);

        emit("generating", "profile_encoded");
        await wait(stepMs);

        emit("generating", "circuit_compiled");
        await wait(stepMs * 0.8);

        emit("verifying", "zk_verify_start");
        await wait(stepMs);

        const r = await verifier();
        setResult(r);

        if (r.tier === "insolvent") {
          emit("fail", "verify_fail");
        } else {
          emit("success", `verify_${r.tier}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Proof generation failed";
        setError(msg);
        emit("fail", "circuit_error");
      } finally {
        running.current = false;
      }
    },
    [stepMs],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setResult(null);
    setError(null);
  }, []);

  const busy = phase === "generating" || phase === "verifying";

  return { phase, result, error, busy, execute, reset };
}
