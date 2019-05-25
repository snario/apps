import { BaseProcessAction } from '../../actions';
import { Commitment } from '../../../../domain';
import { TransactionAction } from '../../transaction-submission/actions';
import {
  ProtocolAction,
  isTransactionAction,
  ChallengeExpiredEvent,
  ChallengeExpirySetEvent,
  CHALLENGE_EXPIRY_SET_EVENT,
  CHALLENGE_EXPIRED_EVENT,
} from '../../../actions';
import { isDefundingAction, DefundingAction } from '../../defunding/actions';
import { ActionConstructor } from '../../../utils';

// -------
// Actions
// -------

export interface RespondApproved extends BaseProcessAction {
  type: 'WALLET.DISUTE.RESPONDER.RESPOND_APPROVED';
  processId: string;
}

export interface ResponseProvided extends BaseProcessAction {
  type: 'WALLET.DISUTE.RESPONDER.RESPONSE_PROVIDED';
  processId: string;
  commitment: Commitment;
}

export interface RespondSuccessAcknowledged extends BaseProcessAction {
  type: 'WALLET.DISUTE.RESPONDER.RESPOND_SUCCESS_ACKNOWLEDGED';
  processId: string;
}

export interface DefundChosen extends BaseProcessAction {
  type: 'WALLET.DISUTE.RESPONDER.DEFUND_CHOSEN';
  processId: string;
}
export interface Acknowledged extends BaseProcessAction {
  type: 'WALLET.DISUTE.RESPONDER.ACKNOWLEDGED';
  processId: string;
}

// --------
// Constructors
// --------

export const respondApproved: ActionConstructor<RespondApproved> = p => ({
  ...p,
  type: 'WALLET.DISUTE.RESPONDER.RESPOND_APPROVED',
});

export const respondSuccessAcknowledged: ActionConstructor<RespondSuccessAcknowledged> = p => ({
  ...p,
  type: 'WALLET.DISUTE.RESPONDER.RESPOND_SUCCESS_ACKNOWLEDGED',
});

export const responseProvided: ActionConstructor<ResponseProvided> = p => ({
  ...p,
  type: 'WALLET.DISUTE.RESPONDER.RESPONSE_PROVIDED',
});

export const defundChosen: ActionConstructor<DefundChosen> = p => ({
  ...p,
  type: 'WALLET.DISUTE.RESPONDER.DEFUND_CHOSEN',
});

export const acknowledged: ActionConstructor<Acknowledged> = p => ({
  ...p,
  type: 'WALLET.DISUTE.RESPONDER.ACKNOWLEDGED',
});

// -------
// Unions and Guards
// -------

export type ResponderAction =
  | TransactionAction
  | DefundingAction
  | RespondApproved
  | ResponseProvided
  | RespondSuccessAcknowledged
  | ChallengeExpiredEvent
  | ChallengeExpirySetEvent
  | DefundChosen
  | Acknowledged;

export function isResponderAction(action: ProtocolAction): action is ResponderAction {
  return (
    isTransactionAction(action) ||
    isDefundingAction(action) ||
    action.type === 'WALLET.DISUTE.RESPONDER.RESPOND_APPROVED' ||
    action.type === 'WALLET.DISUTE.RESPONDER.RESPONSE_PROVIDED' ||
    action.type === 'WALLET.DISUTE.RESPONDER.RESPOND_SUCCESS_ACKNOWLEDGED' ||
    action.type === CHALLENGE_EXPIRY_SET_EVENT ||
    action.type === CHALLENGE_EXPIRED_EVENT ||
    action.type === 'WALLET.DISUTE.RESPONDER.DEFUND_CHOSEN' ||
    action.type === 'WALLET.DISUTE.RESPONDER.ACKNOWLEDGED'
  );
}
