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
} from '../../actions';
import { isTransactionAction, TransactionAction } from '../transaction-submission/actions';
export type ChallengingAction =
  | TransactionAction
  | ChallengeApproved
  | ChallengeDenied
  | RefutedEvent
  | RespondWithMoveEvent
  | ChallengeExpiredEvent
  | ChallengeExpirySetEvent
  | ChallengeTimeoutAcknowledged
  | ChallengeResponseAcknowledged
  | ChallengeFailureAcknowledged;

// ------------
// Action types
// ------------
export const CHALLENGE_APPROVED = 'CHALLENGE.APPROVED';
export const CHALLENGE_DENIED = 'CHALLENGE.DENIED';
export const CHALLENGE_TIMEOUT_ACKNOWLEDGED = 'CHALLENGE.TIMEOUT_ACKNOWLEDGED';
export const CHALLENGE_RESPONSE_ACKNOWLEDGED = 'CHALLENGE.RESPONSE_ACKNOWLEDGED';
export const CHALLENGE_FAILURE_ACKNOWLEDGED = 'CHALLENGE.FAILURE_ACKNOWLEDGED';
// -------
// Actions
// -------
export interface ChallengeApproved {
  type: typeof CHALLENGE_APPROVED;
  processId: string;
}

export interface ChallengeDenied {
  type: typeof CHALLENGE_DENIED;
  processId: string;
}

export interface ChallengeTimeoutAcknowledged {
  type: typeof CHALLENGE_TIMEOUT_ACKNOWLEDGED;
  processId: string;
}

export interface ChallengeResponseAcknowledged {
  type: typeof CHALLENGE_RESPONSE_ACKNOWLEDGED;
  processId: string;
}

export interface ChallengeFailureAcknowledged {
  type: typeof CHALLENGE_FAILURE_ACKNOWLEDGED;
  processId: string;
}

// --------
// Creators
// --------
export const challengeApproved = (processId: string): ChallengeApproved => ({
  type: CHALLENGE_APPROVED,
  processId,
});

export const challengeDenied = (processId: string): ChallengeDenied => ({
  type: CHALLENGE_DENIED,
  processId,
});

export const challengeTimeoutAcknowledged = (processId: string): ChallengeTimeoutAcknowledged => ({
  type: CHALLENGE_TIMEOUT_ACKNOWLEDGED,
  processId,
});

export const challengeResponseAcknowledged = (
  processId: string,
): ChallengeResponseAcknowledged => ({
  type: CHALLENGE_RESPONSE_ACKNOWLEDGED,
  processId,
});

export const challengeFailureAcknowledged = (processId: string): ChallengeFailureAcknowledged => ({
  type: CHALLENGE_FAILURE_ACKNOWLEDGED,
  processId,
});

export function isChallengingAction(action: ProtocolAction): action is ChallengingAction {
  return (
    isTransactionAction(action) ||
    action.type === CHALLENGE_APPROVED ||
    action.type === CHALLENGE_DENIED ||
    action.type === CHALLENGE_TIMEOUT_ACKNOWLEDGED ||
    action.type === CHALLENGE_RESPONSE_ACKNOWLEDGED ||
    action.type === CHALLENGE_FAILURE_ACKNOWLEDGED ||
    action.type === CHALLENGE_EXPIRED_EVENT ||
    action.type === RESPOND_WITH_MOVE_EVENT ||
    action.type === REFUTED_EVENT ||
    action.type === CHALLENGE_EXPIRY_SET_EVENT
  );
}
