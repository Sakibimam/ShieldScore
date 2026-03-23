"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";

export type WalletState = {
  /** The ConnectedAPI instance — null when disconnected */
  api: ConnectedAPI | null;
  /** The user's unshielded (public) address */
  address: string | null;
  /** True while a connection attempt is in progress */
  connecting: boolean;
  /** True when a wallet extension is detected in the browser */
  walletAvailable: boolean;
  /** Human-readable error from the last failed attempt */
  error: string | null;
  /** Trigger a connection to the first detected Midnight wallet */
  connect: () => Promise<void>;
  /** Drop the current connection */
  disconnect: () => void;
};

const NETWORK_ID = "preprod";
const POLL_MS = 1500;

/**
 * React hook for Midnight wallet connection lifecycle.
 *
 * Handles wallet detection, connection, address resolution,
 * and disconnect. Polls `window.midnight` for late-loading extensions.
 *
 * ```tsx
 * const { api, address, connect, connecting } = useMidnightWallet();
 * ```
 */
export function useMidnightWallet(
  opts: {
    networkId?: string;
    onConnect?: (address: string, api: ConnectedAPI) => void;
    onDisconnect?: () => void;
    onError?: (error: string) => void;
  } = {},
): WalletState {
  const networkId = opts.networkId ?? NETWORK_ID;

  const [api, setApi] = useState<ConnectedAPI | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletAvailable, setWalletAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optsRef = useRef(opts);
  optsRef.current = opts;

  // Poll for wallet extension availability (extensions can load after page)
  useEffect(() => {
    function check() {
      const found = typeof window !== "undefined" && !!window.midnight && Object.keys(window.midnight).length > 0;
      setWalletAvailable(found);
    }
    check();
    const id = setInterval(check, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);

    try {
      const wallets: InitialAPI[] = Object.values(window.midnight ?? {});

      if (wallets.length === 0) {
        const msg = "No Midnight wallet found. Install Lace.";
        setError(msg);
        optsRef.current.onError?.(msg);
        return;
      }

      const wallet = wallets[0];
      const connected: ConnectedAPI = await wallet.connect(networkId);
      const { unshieldedAddress } = await connected.getUnshieldedAddress();

      setApi(connected);
      setAddress(unshieldedAddress);
      optsRef.current.onConnect?.(unshieldedAddress, connected);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError(msg);
      optsRef.current.onError?.(msg);
    } finally {
      setConnecting(false);
    }
  }, [networkId]);

  const disconnect = useCallback(() => {
    setApi(null);
    setAddress(null);
    setError(null);
    optsRef.current.onDisconnect?.();
  }, []);

  return { api, address, connecting, walletAvailable, error, connect, disconnect };
}
