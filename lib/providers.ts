/**
 * On-chain provider setup — dynamically imported only when doing real ZK proving.
 * Kept separate from lib/contract.ts to avoid pulling heavy SDK deps into the
 * pure-circuit path (which causes bundler issues with isomorphic-ws, etc.).
 *
 * Usage:
 *   const { buildProviders } = await import("@/lib/providers");
 *   const { providers, config } = await buildProviders(walletApi);
 */

import type { ConnectedAPI, Configuration } from "@midnight-ntwrk/dapp-connector-api";
import type { MidnightProviders } from "@midnight-ntwrk/midnight-js-types";
import { createProofProvider } from "@midnight-ntwrk/midnight-js-types";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";

type CircuitId = "proveSolvency" | "proveExcellentTier";

export async function buildProviders(
  walletApi: ConnectedAPI,
): Promise<{
  providers: MidnightProviders<CircuitId>;
  config: Configuration;
}> {
  const config = await walletApi.getConfiguration();
  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider<CircuitId>(
    "/api/zk-keys",
  );

  const keyMaterialProvider = {
    async getZKIR(circuitId: string) {
      return zkConfigProvider.getZKIR(circuitId as CircuitId).then((r) => new Uint8Array(r));
    },
    async getProverKey(circuitId: string) {
      return zkConfigProvider.getProverKey(circuitId as CircuitId).then((r) => new Uint8Array(r));
    },
    async getVerifierKey(circuitId: string) {
      return zkConfigProvider.getVerifierKey(circuitId as CircuitId).then((r) => new Uint8Array(r));
    },
  };

  const provingProvider = await walletApi.getProvingProvider(keyMaterialProvider);
  const proofProvider = createProofProvider(provingProvider);

  const publicDataProvider = indexerPublicDataProvider(
    config.indexerUri,
    config.indexerWsUri,
  );

  const walletProvider = {
    async balanceTx(tx: unknown, _ttl?: Date) {
      const serialized = (tx as { serialize(networkId: string): Uint8Array }).serialize(config.networkId);
      const hex = Array.from(serialized, (b) => b.toString(16).padStart(2, "0")).join("");
      const { tx: balancedHex } = await walletApi.balanceUnsealedTransaction(hex);
      return balancedHex as unknown as ReturnType<MidnightProviders["walletProvider"]["balanceTx"]>;
    },
    getCoinPublicKey() {
      throw new Error("getCoinPublicKey: use walletApi.getShieldedAddresses() instead");
    },
    getEncryptionPublicKey() {
      throw new Error("getEncryptionPublicKey: use walletApi.getShieldedAddresses() instead");
    },
  };

  const midnightProvider = {
    async submitTx(tx: string) {
      await walletApi.submitTransaction(tx);
      return tx;
    },
  };

  const noopPrivateState = new Proxy({} as MidnightProviders["privateStateProvider"], {
    get: (_target, prop) => {
      if (typeof prop === "string") return () => Promise.resolve(null);
      return undefined;
    },
  });

  return {
    config,
    providers: {
      privateStateProvider: noopPrivateState,
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider: walletProvider as unknown as MidnightProviders["walletProvider"],
      midnightProvider: midnightProvider as unknown as MidnightProviders["midnightProvider"],
    },
  };
}
