import {
  ProtocolAction,
  ChallengeExpiredEvent,
  RefutedEvent,
  RespondWithMoveEvent,
  CHALLENGE_EXPIRED_EVENT,
  RESPOND_WITH_MOVE_EVENT,
  REFUTED_EVENT,
  ChallengeExpirySetEvent,
  CHALLENGE_EXPIRY_SET_EVENT,
} from '../../../actions';
import { isTransactionAction, TransactionAction } from '../../transaction-submission/actions';
import { isDefundingAction } from '../../defunding/actions';
import { ActionConstructor } from '../../../utils';

// -------
// Actions
// -------

export interface ChallengeApproved {
  type: 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_APPROVED';
  processId: string;
}

export interface ChallengeDenied {
  type: 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_DENIED';
  processId: string;
}

export interface ChallengeResponseAcknowledged {
  type: 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_RESPONSE_ACKNOWLEDGED';
  processId: string;
}

export interface ChallengeFailureAcknowledged {
  type: 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_FAILURE_ACKNOWLEDGED';
  processId: string;
}

export interface DefundChosen {
  type: 'WALLET.CHALLENGING.CHALLENGER.DEFUND_CHOSEN';
  processId: string;
}

export interface Acknowledged {
  type: 'WALLET.CHALLENGING.CHALLENGER.ACKNOWLEDGED';
  processId: string;
}

// -------
// Constructors
// -------

export const challengeApproved: ActionConstructor<ChallengeApproved> = p => ({
  type: 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_APPROVED',
  processId: p.processId,
});

export const challengeDenied: ActionConstructor<ChallengeDenied> = p => ({
  type: 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_DENIED',
  processId: p.processId,
});

export const challengeResponseAcknowledged: ActionConstructor<
  ChallengeResponseAcknowledged
> = p => ({
  type: 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_RESPONSE_ACKNOWLEDGED',
  processId: p.processId,
});

export const challengeFailureAcknowledged: ActionConstructor<ChallengeFailureAcknowledged> = p => ({
  type: 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_FAILURE_ACKNOWLEDGED',
  processId: p.processId,
});

export const defundChosen: ActionConstructor<DefundChosen> = p => ({
  type: 'WALLET.CHALLENGING.CHALLENGER.DEFUND_CHOSEN',
  processId: p.processId,
});

export const acknowledged: ActionConstructor<Acknowledged> = p => ({
  type: 'WALLET.CHALLENGING.CHALLENGER.ACKNOWLEDGED',
  processId: p.processId,
});

// -------
// Unions and Guards
// -------

export type ChallengerAction =
  | TransactionAction
  | ChallengeApproved
  | ChallengeDenied
  | RefutedEvent
  | RespondWithMoveEvent
  | ChallengeExpiredEvent
  | ChallengeExpirySetEvent
  | ChallengeResponseAcknowledged
  | ChallengeFailureAcknowledged
  | DefundChosen
  | Acknowledged;

export function isChallengerAction(action: ProtocolAction): action is ChallengerAction {
  return (
    isTransactionAction(action) ||
    isDefundingAction(action) ||
    action.type === 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_APPROVED' ||
    action.type === 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_DENIED' ||
    action.type === 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_RESPONSE_ACKNOWLEDGED' ||
    action.type === 'WALLET.CHALLENGING.CHALLENGER.CHALLENGE_FAILURE_ACKNOWLEDGED' ||
    action.type === CHALLENGE_EXPIRED_EVENT ||
    action.type === RESPOND_WITH_MOVE_EVENT ||
    action.type === REFUTED_EVENT ||
    action.type === CHALLENGE_EXPIRY_SET_EVENT ||
    action.type === 'WALLET.CHALLENGING.CHALLENGER.DEFUND_CHOSEN' ||
    action.type === 'WALLET.CHALLENGING.CHALLENGER.ACKNOWLEDGED'
  );
}