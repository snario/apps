import { StateConstructor } from '../../utils';
import { ProtocolState } from '..';
import { ConsensusUpdateState } from '../consensus-update/states';
import { ProtocolLocator } from '../../../communication';
// -------
// States
// -------

export interface WaitForLedgerUpdate {
  type: 'IndirectDefunding.WaitForLedgerUpdate';
  processId: string;
  ledgerId: string;
  channelId: string;
  clearedToProceed: boolean;
  ledgerUpdate: ConsensusUpdateState;
  protocolLocator: ProtocolLocator;
}

export interface Failure {
  type: 'IndirectDefunding.Failure';
  reason: string;
}

export interface Success {
  type: 'IndirectDefunding.Success';
}

// -------
// Constructors
// -------

export const waitForLedgerUpdate: StateConstructor<WaitForLedgerUpdate> = p => {
  return {
    ...p,
    type: 'IndirectDefunding.WaitForLedgerUpdate',
  };
};

export const success: StateConstructor<Success> = p => {
  return { ...p, type: 'IndirectDefunding.Success' };
};

export const failure: StateConstructor<Failure> = p => {
  return { ...p, type: 'IndirectDefunding.Failure' };
};

// -------
// Unions and Guards
// -------

export type NonTerminalIndirectDefundingState = WaitForLedgerUpdate;
export type IndirectDefundingState = NonTerminalIndirectDefundingState | Success | Failure;
export type IndirectDefundingStateType = IndirectDefundingState['type'];

export function isTerminal(state: IndirectDefundingState): state is Failure | Success {
  return state.type === 'IndirectDefunding.Failure' || state.type === 'IndirectDefunding.Success';
}

export function isIndirectDefundingState(state: ProtocolState): state is IndirectDefundingState {
  return (
    state.type === 'IndirectDefunding.WaitForLedgerUpdate' ||
    state.type === 'IndirectDefunding.Failure' ||
    state.type === 'IndirectDefunding.Success'
  );
}
