"use client";

/**
 * Standalone wallet connect button.
 *
 * For the main dashboard, wallet UI is rendered directly in LeftPanel
 * using the useMidnightWallet hook. This component exists for reuse
 * on other pages that just need a quick connect button.
 */

import { useMidnightWallet } from "@/hooks";

export default function WalletConnect({
  onConnect,
}: {
  onConnect?: (address: string) => void;
}) {
  const wallet = useMidnightWallet({
    onConnect: (addr) => onConnect?.(addr),
  });

  if (wallet.address) {
    return (
      <div className="flex w-full items-center gap-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-white/60">
          {wallet.address}
        </code>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        onClick={wallet.connect}
        disabled={wallet.connecting}
        className="flex w-full items-center justify-between border border-white/25 px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white"
      >
        <span>{wallet.connecting ? "Connecting…" : "Link Wallet"}</span>
        <span aria-hidden="true">→</span>
      </button>
      {wallet.error && (
        <p className="font-mono text-[10px] text-red-400/80">{wallet.error}</p>
      )}
    </div>
  );
}
