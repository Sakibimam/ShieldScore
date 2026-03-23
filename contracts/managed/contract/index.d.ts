import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getProfile(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { income: bigint,
                                                                           debt: bigint,
                                                                           defiAssets: bigint
                                                                         }];
}

export type ImpureCircuits<PS> = {
  proveSolvency(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  proveExcellentTier(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  proveSolvency(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  proveExcellentTier(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  isSolvent(profile_0: { income: bigint, debt: bigint, defiAssets: bigint }): boolean;
  isExcellentTier(profile_0: { income: bigint, debt: bigint, defiAssets: bigint
                             }): boolean;
}

export type Circuits<PS> = {
  isSolvent(context: __compactRuntime.CircuitContext<PS>,
            profile_0: { income: bigint, debt: bigint, defiAssets: bigint }): __compactRuntime.CircuitResults<PS, boolean>;
  isExcellentTier(context: __compactRuntime.CircuitContext<PS>,
                  profile_0: { income: bigint, debt: bigint, defiAssets: bigint
                             }): __compactRuntime.CircuitResults<PS, boolean>;
  proveSolvency(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  proveExcellentTier(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly lastTier: number;
  readonly verifyCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
