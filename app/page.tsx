"use client";

import { useState } from "react";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import WalletConnect from "@/components/WalletConnect";
import ProofForm from "@/components/ProofForm";

export default function Home() {
  const [walletApi, setWalletApi] = useState<ConnectedAPI | null>(null);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-950">
      <main className="flex flex-col items-center gap-8 py-32 px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          ShieldScore
        </h1>
        <p className="max-w-md text-center text-zinc-400">
          Zero-knowledge credit &amp; solvency verification on Midnight.
          Your financial data never leaves your device.
        </p>
        <div className="mt-4">
          <WalletConnect onConnect={(_addr, api) => setWalletApi(api)} />
        </div>
        {walletApi && (
          <div className="mt-6">
            <ProofForm walletApi={walletApi} />
          </div>
        )}
      </main>
    </div>
  );
}
