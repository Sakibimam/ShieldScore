import {
  pureCircuits,
  Contract,
  ledger,
  type Witnesses,
  type Ledger,
  type PureCircuits,
} from "@/contracts/managed/contract/index.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Profile = { income: bigint; debt: bigint; defiAssets: bigint };

export type ShieldScoreContract = Contract<undefined>;

// ---------------------------------------------------------------------------
// Pure circuits — run locally, same logic as the ZK circuit
// ---------------------------------------------------------------------------

export function isSolvent(profile: Profile): boolean {
  return pureCircuits.isSolvent(profile);
}

export function isExcellentTier(profile: Profile): boolean {
  return pureCircuits.isExcellentTier(profile);
}

export function toProfile(income: number, debt: number, defiAssets: number): Profile {
  return {
    income: BigInt(Math.round(income)),
    debt: BigInt(Math.round(debt)),
    defiAssets: BigInt(Math.round(defiAssets)),
  };
}

// ---------------------------------------------------------------------------
// Witness implementation — feeds private data into the ZK circuit
// ---------------------------------------------------------------------------

let _pendingProfile: Profile | null = null;

export function setPrivateProfile(profile: Profile) {
  _pendingProfile = profile;
}

const witnesses: Witnesses<undefined> = {
  getProfile(_ctx) {
    if (!_pendingProfile) throw new Error("No profile set — call setPrivateProfile first");
    return [undefined, _pendingProfile];
  },
};

// ---------------------------------------------------------------------------
// Contract instance
// ---------------------------------------------------------------------------

export const contractInstance = new Contract(witnesses);

export { ledger, pureCircuits };
