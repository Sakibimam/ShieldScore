"use client";

import { useState } from "react";
import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";

const NETWORK_ID = "preprod";

export default function WalletConnect({
  onConnect,
}: {
  onConnect?: (address: string, api: ConnectedAPI) => void;
}) {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  async function connect() {
    setError(null);
    setConnecting(true);

    try {
      const wallets: InitialAPI[] = Object.values(window.midnight ?? {});

      if (wallets.length === 0) {
        setError("No Midnight wallet found. Install Lace.");
        return;
      }

      const wallet = wallets[0];
      const api: ConnectedAPI = await wallet.connect(NETWORK_ID);
      const { unshieldedAddress } = await api.getUnshieldedAddress();
      setAddress(unshieldedAddress);
      onConnect?.(unshieldedAddress, api);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError(msg);
    } finally {
      setConnecting(false);
    }
  }

  if (address) {
    return (
      <div className="flex w-full items-center gap-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-white/60">
          {address}
        </code>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        onClick={connect}
        disabled={connecting}
        className="flex w-full items-center justify-between border border-white/25 px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white"
      >
        <span>{connecting ? "Connecting…" : "Link Wallet"}</span>
        <span aria-hidden="true">→</span>
      </button>
      {error && (
        <p className="font-mono text-[10px] text-red-400/80">{error}</p>
      )}
    </div>
  );
}
