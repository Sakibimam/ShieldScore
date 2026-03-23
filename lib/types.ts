export type ProofPhase = "idle" | "generating" | "verifying" | "success" | "fail";

export type Tier = "excellent" | "solvent" | "insolvent";

export type ProofResult = { tier: Tier; ratio: number };

export type FormData = { income: number; debt: number; defiAssets: number };
