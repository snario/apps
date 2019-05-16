import { BaseProcessAction } from '../actions';
import { Commitment } from '../../../domain';
import { TransactionAction } from '../transaction-submission/actions';
import { ProtocolAction, isTransactionAction } from '../../actions';

export type RespondingAction =
  | RespondApproved
  | ResponseProvided
  | RespondSuccessAcknowledged
  | TransactionAction;

export const RESPOND_APPROVED = 'WALLET.RESPOND_APPROVED';
export const RESPONSE_PROVIDED = 'WALLET.RESPONSE_PROVIDED';
export const RESPOND_SUCCESS_ACKNOWLEDGED = 'WALLET.RESPOND_SUCCESS_ACKNOWLEDGED';

export interface RespondApproved extends BaseProcessAction {
  type: typeof RESPOND_APPROVED;
  processId: string;
}

export interface ResponseProvided extends BaseProcessAction {
  type: typeof RESPONSE_PROVIDED;
  processId: string;
  commitment: Commitment;
}

export interface RespondSuccessAcknowledged extends BaseProcessAction {
  type: typeof RESPOND_SUCCESS_ACKNOWLEDGED;
  processId: string;
}

// --------
// Creators
// --------

export const respondApproved = (processId: string): RespondApproved => ({
  type: RESPOND_APPROVED,
  processId,
});

export const respondSuccessAcknowledged = (processId: string): RespondSuccessAcknowledged => ({
  type: RESPOND_SUCCESS_ACKNOWLEDGED,
  processId,
});

export const responseProvided = (processId: string, commitment: Commitment): ResponseProvided => ({
  type: RESPONSE_PROVIDED,
  processId,
  commitment,
});

export function isRespondingAction(action: ProtocolAction): action is RespondingAction {
  return (
    isTransactionAction(action) ||
    action.type === RESPOND_APPROVED ||
    action.type === RESPONSE_PROVIDED ||
    action.type === RESPOND_SUCCESS_ACKNOWLEDGED
  );
}
