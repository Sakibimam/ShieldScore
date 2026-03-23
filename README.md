# ShieldScore

Zero-knowledge credit and solvency verification on [Midnight](https://midnight.network).

Users prove they're solvent without revealing income, debt, or asset data. Financial information never leaves the browser — only cryptographic proofs are submitted to the chain.

---

## How It Works

```
User enters financial data (local)
        ↓
Pure circuit evaluates solvency (local)
        ↓
ZK proof generated (wallet/proof server)
        ↓
Proof verified on-chain (Midnight)
        ↓
Only the result is public: SOLVENT / EXCELLENT / FAIL
```

### Privacy Model

| Data | Where it lives |
|------|---------------|
| Income, debt, DeFi assets | Browser only — never sent anywhere |
| Solvency proof | Generated locally via ZK circuit |
| Verification result | On-chain (boolean + tier) |
| Raw financial data | **Never on-chain, never on a server** |

### Verification Tiers

- **Excellent** — assets >= 3x debt
- **Solvent** — assets > debt
- **Insolvent** — assets <= debt (proof rejected)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Blockchain | Midnight Network (preprod testnet) |
| Smart contract | Compact language |
| Wallet | Lace via `@midnight-ntwrk/dapp-connector-api` v4 |
| ZK proving | Compiled Compact circuits (local pure + on-chain) |

---

## Project Structure

```
app/                  → Next.js pages and layout
components/           → UI components (Header, LeftPanel, RightPanel, LogsPanel, etc.)
hooks/                → Reusable React hooks (wallet, proof lifecycle, logs)
lib/                  → Contract integration and shared types
contracts/            → Compact source + compiled output
  shield_score.compact  → ZK contract (Profile struct, solvency circuits)
  managed/              → Compiled JS, ZK keys, ZKIR artifacts
```

### Hooks (reusable SDK layer)

| Hook | Purpose |
|------|---------|
| `useMidnightWallet()` | Wallet connection lifecycle, auto-detection, connect/disconnect |
| `useProofLifecycle()` | Proof phase state machine (idle → generating → verifying → success/fail) |
| `useLogs()` | Structured timestamped event logging |

These hooks are framework-agnostic in logic and designed to be extractable into a standalone npm package.

---

## Smart Contract

Written in [Compact](https://docs.midnight.network), Midnight's DSL for ZK circuits.

**Key elements:**

- `Profile` struct — `income`, `debt`, `defiAssets` (all `Uint<64>`)
- `isSolvent` pure circuit — checks `(income + defiAssets) > debt`
- `isExcellentTier` pure circuit — checks `(income + defiAssets) >= 3 * debt`
- `proveSolvency` / `proveExcellentTier` — on-chain circuits that verify proofs and update ledger
- `getProfile` witness — supplies private data to the circuit at prove-time (never stored)

The contract stores only the verification tier and a counter — zero financial data on-chain.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Google Chrome (for Lace wallet extension)
- [Lace Wallet](https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg) with Midnight enabled
- tDUST tokens from the [Midnight faucet](https://faucet.midnight.network)

### Install & Run

```bash
git clone https://github.com/Sakibimam/ShieldScore.git
cd ShieldScore
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect your Lace wallet, enter financial data, and generate a proof.

### Build

```bash
npm run build
```

### Recompile Contract (optional)

Requires the [Compact compiler](https://docs.midnight.network) (`~/.local/bin/compact`):

```bash
compact compile contracts/shield_score.compact --output contracts/managed
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Browser (Next.js)                          │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Wallet  │  │ Proof    │  │ Contract  │  │
│  │ Hook    │  │ Lifecycle│  │ Lib       │  │
│  └────┬────┘  └────┬─────┘  └─────┬─────┘  │
│       │            │              │         │
│       ▼            ▼              ▼         │
│  ┌─────────────────────────────────────┐    │
│  │ Private data stays here. Always.    │    │
│  └─────────────────────────────────────┘    │
└──────────────┬──────────────────────────────┘
               │ ZK proof only
               ▼
┌──────────────────────────┐
│  Midnight Network        │
│  (preprod testnet)       │
│                          │
│  Verifies proof.         │
│  Stores: tier + count.   │
│  Stores: nothing else.   │
└──────────────────────────┘
```

---

## Roadmap

- [x] Wallet connection (Lace, preprod)
- [x] Local proof evaluation (pure circuits)
- [x] Proof lifecycle with animated UI
- [x] Reusable hooks layer
- [ ] Deploy contract to preprod (requires tDUST)
- [ ] Serve ZK keys via `/api/zk-keys`
- [ ] Wire on-chain proving through wallet
- [ ] Full E2E: form → ZK proof → on-chain verification

---

## License

MIT
