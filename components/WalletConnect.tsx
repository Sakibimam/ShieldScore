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
        setError("No Midnight wallet found. Install Lace wallet extension.");
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
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm text-emerald-400">Connected</span>
        <code className="rounded-lg bg-zinc-800 px-4 py-2 text-xs text-zinc-300 max-w-xs truncate">
          {address}
        </code>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={connect}
        disabled={connecting}
        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
