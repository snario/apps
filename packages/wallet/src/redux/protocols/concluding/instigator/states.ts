import { StateConstructor } from '../../../utils';
import { DefundingState } from '../../defunding';
export type InstigatorConcludingState =
  | InstigatorNonTerminalState
  | InstigatorPreTerminalState
  | TerminalState;
export type InstigatorConcludingStateType = InstigatorConcludingState['type'];
import { ProtocolState } from '../..';
import { FailureReason, TerminalState } from '../states';
import { ConsensusUpdateState } from '../../consensus-update/states';

// -------
// States
// -------
export interface AcknowledgeSuccess {
  type: 'ConcludingInstigator.AcknowledgeSuccess';
  processId: string;
  channelId: string;
}
export interface AcknowledgeFailure {
  type: 'ConcludingInstigator.AcknowledgeFailure';
  reason: FailureReason;
  processId: string;
  channelId: string;
}
export interface ApproveConcluding {
  type: 'ConcludingInstigator.ApproveConcluding';
  processId: string;
  channelId: string;
}

export interface WaitForOpponentConclude {
  type: 'ConcludingInstigator.WaitForOpponentConclude';
  processId: string;
  channelId: string;
}

export interface AcknowledgeConcludeReceived {
  type: 'ConcludingInstigator.AcknowledgeConcludeReceived';
  processId: string;
  channelId: string;
}

export interface WaitForDefund {
  type: 'ConcludingInstigator.WaitForDefund';
  processId: string;
  channelId: string;
  defundingState: DefundingState;
}

export interface WaitForLedgerUpdate {
  type: 'ConcludingInstigator.WaitForLedgerUpdate';
  processId: string;
  channelId: string;
  consensusUpdateState: ConsensusUpdateState;
}

// ------------
// Constructors
// ------------

export const instigatorApproveConcluding: StateConstructor<ApproveConcluding> = p => {
  return { ...p, type: 'ConcludingInstigator.ApproveConcluding' };
};

export const instigatorWaitForOpponentConclude: StateConstructor<WaitForOpponentConclude> = p => {
  return { ...p, type: 'ConcludingInstigator.WaitForOpponentConclude' };
};

export const instigatorAcknowledgeConcludeReceived: StateConstructor<
  AcknowledgeConcludeReceived
> = p => {
  return { ...p, type: 'ConcludingInstigator.AcknowledgeConcludeReceived' };
};

export const instigatorAcknowledgeSuccess: StateConstructor<AcknowledgeSuccess> = p => {
  return { ...p, type: 'ConcludingInstigator.AcknowledgeSuccess' };
};

export const instigatorAcknowledgeFailure: StateConstructor<AcknowledgeFailure> = p => {
  return { ...p, type: 'ConcludingInstigator.AcknowledgeFailure' };
};

export const instigatorWaitForDefund: StateConstructor<WaitForDefund> = p => {
  return { ...p, type: 'ConcludingInstigator.WaitForDefund' };
};

export const instigatorWaitForLedgerUpdate: StateConstructor<WaitForLedgerUpdate> = p => {
  return { ...p, type: 'ConcludingInstigator.WaitForLedgerUpdate' };
};

// -------
// Unions and Guards
// -------
export type InstigatorNonTerminalState =
  | ApproveConcluding
  | WaitForOpponentConclude
  | AcknowledgeConcludeReceived
  | AcknowledgeFailure
  | AcknowledgeSuccess
  | WaitForDefund
  | WaitForLedgerUpdate;

export type InstigatorPreTerminalState = AcknowledgeSuccess | AcknowledgeFailure;

export function isConcludingInstigatorState(
  state: ProtocolState,
): state is InstigatorConcludingState {
  return (
    state.type === 'ConcludingInstigator.AcknowledgeSuccess' ||
    state.type === 'ConcludingInstigator.AcknowledgeFailure' ||
    state.type === 'ConcludingInstigator.ApproveConcluding' ||
    state.type === 'ConcludingInstigator.WaitForOpponentConclude' ||
    state.type === 'ConcludingInstigator.AcknowledgeConcludeReceived' ||
    state.type === 'ConcludingInstigator.WaitForDefund'
  );
}
