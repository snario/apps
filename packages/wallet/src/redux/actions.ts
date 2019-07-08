import * as channel from './channel-store/actions';
import * as directFunding from './protocols/direct-funding/actions';
import * as newLedgerFunding from './protocols/new-ledger-funding/actions';
import * as application from './protocols/application/actions';
import * as protocol from './protocols/actions';
import * as advanceChannel from './protocols/advance-channel';
import { FundingAction, isFundingAction } from './protocols/funding/actions';
import { CommitmentReceived, commitmentReceived, RelayableAction } from '../communication';
import {
  TransactionAction as TA,
  isTransactionAction as isTA,
} from './protocols/transaction-submission/actions';

import { ConcludingAction, isConcludingAction } from './protocols/concluding';
import { ApplicationAction } from './protocols/application/actions';
import { ActionConstructor } from './utils';
import { Commitment } from '../domain';
import { isDefundingAction, DefundingAction } from './protocols/defunding/actions';
import { AdvanceChannelAction } from './protocols/advance-channel/actions';
import { LOAD } from 'redux-storage';
export * from './protocols/transaction-submission/actions';
export { CommitmentReceived, commitmentReceived };

export type TransactionAction = TA;
export const isTransactionAction = isTA;

// -------
// Actions
// -------

export interface MultipleWalletActions {
  type: 'WALLET.MULTIPLE_ACTIONS';
  actions: WalletAction[];
}
export interface LoggedIn {
  type: 'WALLET.LOGGED_IN';
  uid: string;
}

export interface AdjudicatorKnown {
  type: 'WALLET.ADJUDICATOR_KNOWN';
  networkId: string;
  adjudicator: string;
}

export interface MessageSent {
  type: 'WALLET.MESSAGE_SENT';
}

export interface DisplayMessageSent {
  type: 'WALLET.DISPLAY_MESSAGE_SENT';
}

export interface BlockMined {
  type: 'BLOCK_MINED';
  block: { timestamp: number; number: number };
}

export interface MetamaskLoadError {
  type: 'METAMASK_LOAD_ERROR';
}

export type Message = 'FundingDeclined';

export interface MessageReceived {
  type: 'WALLET.COMMON.MESSAGE_RECEIVED';
  processId: string;
  data: Message;
}

export interface ChallengeExpirySetEvent {
  type: 'WALLET.ADJUDICATOR.CHALLENGE_EXPIRY_TIME_SET';
  processId: string;
  channelId: string;
  expiryTime;
}

export interface ChallengeCreatedEvent {
  type: 'WALLET.ADJUDICATOR.CHALLENGE_CREATED_EVENT';
  channelId: string;
  commitment: Commitment;
  finalizedAt: number;
}

export interface ConcludedEvent {
  channelId: string;
  type: 'WALLET.ADJUDICATOR.CONCLUDED_EVENT';
}

export interface RefutedEvent {
  type: 'WALLET.ADJUDICATOR.REFUTED_EVENT';
  processId: string;
  channelId: string;
  refuteCommitment: Commitment;
}

export interface RespondWithMoveEvent {
  processId: string;
  channelId: string;
  responseCommitment: Commitment;
  responseSignature: string;
  type: 'WALLET.ADJUDICATOR.RESPOND_WITH_MOVE_EVENT';
}

export interface FundingReceivedEvent {
  type: 'WALLET.ADJUDICATOR.FUNDING_RECEIVED_EVENT';
  processId: string;
  channelId: string;
  amount: string;
  totalForDestination: string;
}

export interface ChallengeExpiredEvent {
  type: 'WALLET.ADJUDICATOR.CHALLENGE_EXPIRED';
  processId: string;
  channelId: string;
  timestamp: number;
}

export interface ChannelUpdate {
  type: 'WALLET.ADJUDICATOR.CHANNEL_UPDATE';
  channelId: string;
  isFinalized: boolean;
  balance: string;
}

export interface LockChannelRequest {
  type: 'WALLET.LOCKING.LOCK_CHANNEL_REQUEST';
  processId: string;
  channelId: string;
}
export interface UnlockChannelRequest {
  type: 'WALLET.LOCKING.UNLOCK_CHANNEL_REQUEST';
  processId: string;
  channelId: string;
}
export interface ChannelLocked {
  type: 'WALLET.LOCKING.CHANNEL_LOCKED';
  processId: string;
  channelId: string;
}
export interface ChannelUnlocked {
  type: 'WALLET.LOCKING.CHANNEL_UNLOCKED';
  processId: string;
  channelId: string;
}
// -------
// Constructors
// -------
export const channelLocked: ActionConstructor<ChannelLocked> = p => ({
  ...p,
  type: 'WALLET.LOCKING.CHANNEL_LOCKED',
});
export const channelUnlocked: ActionConstructor<ChannelUnlocked> = p => ({
  ...p,
  type: 'WALLET.LOCKING.CHANNEL_UNLOCKED',
});
export const lockChannelRequest: ActionConstructor<LockChannelRequest> = p => ({
  ...p,
  type: 'WALLET.LOCKING.LOCK_CHANNEL_REQUEST',
});
export const unlockChannelRequest: ActionConstructor<UnlockChannelRequest> = p => ({
  ...p,
  type: 'WALLET.LOCKING.UNLOCK_CHANNEL_REQUEST',
});
export const multipleWalletActions: ActionConstructor<MultipleWalletActions> = p => ({
  ...p,
  type: 'WALLET.MULTIPLE_ACTIONS',
});

export const loggedIn: ActionConstructor<LoggedIn> = p => ({ ...p, type: 'WALLET.LOGGED_IN' });

export const adjudicatorKnown: ActionConstructor<AdjudicatorKnown> = p => ({
  ...p,
  type: 'WALLET.ADJUDICATOR_KNOWN',
});

export const messageSent: ActionConstructor<MessageSent> = p => ({
  ...p,
  type: 'WALLET.MESSAGE_SENT',
});

export const displayMessageSent: ActionConstructor<DisplayMessageSent> = p => ({
  ...p,
  type: 'WALLET.DISPLAY_MESSAGE_SENT',
});

export const blockMined: ActionConstructor<BlockMined> = p => ({ ...p, type: 'BLOCK_MINED' });

export const metamaskLoadError: ActionConstructor<MetamaskLoadError> = p => ({
  ...p,
  type: 'METAMASK_LOAD_ERROR',
});

export const messageReceived: ActionConstructor<MessageReceived> = p => ({
  ...p,
  type: 'WALLET.COMMON.MESSAGE_RECEIVED',
});

export const challengeExpirySetEvent: ActionConstructor<ChallengeExpirySetEvent> = p => ({
  ...p,
  type: 'WALLET.ADJUDICATOR.CHALLENGE_EXPIRY_TIME_SET',
});

export const challengeCreatedEvent: ActionConstructor<ChallengeCreatedEvent> = p => ({
  ...p,
  type: 'WALLET.ADJUDICATOR.CHALLENGE_CREATED_EVENT',
});

export const concludedEvent: ActionConstructor<ConcludedEvent> = p => ({
  ...p,
  type: 'WALLET.ADJUDICATOR.CONCLUDED_EVENT',
});

export const refutedEvent: ActionConstructor<RefutedEvent> = p => ({
  ...p,
  type: 'WALLET.ADJUDICATOR.REFUTED_EVENT',
});

export const respondWithMoveEvent: ActionConstructor<RespondWithMoveEvent> = p => ({
  ...p,
  type: 'WALLET.ADJUDICATOR.RESPOND_WITH_MOVE_EVENT',
});
export const fundingReceivedEvent: ActionConstructor<FundingReceivedEvent> = p => ({
  ...p,
  type: 'WALLET.ADJUDICATOR.FUNDING_RECEIVED_EVENT',
});
export const challengeExpiredEvent: ActionConstructor<ChallengeExpiredEvent> = p => ({
  ...p,
  type: 'WALLET.ADJUDICATOR.CHALLENGE_EXPIRED',
});
export const channelUpdate: ActionConstructor<ChannelUpdate> = p => ({
  ...p,
  type: 'WALLET.ADJUDICATOR.CHANNEL_UPDATE',
});

// -------
// Unions and Guards
// -------

export type AdjudicatorEventAction =
  | ConcludedEvent
  | RefutedEvent
  | RespondWithMoveEvent
  | FundingReceivedEvent
  | ChallengeExpiredEvent
  | ChallengeCreatedEvent
  | ChallengeExpirySetEvent
  | ChannelUpdate;

export type CommonAction = MessageReceived | CommitmentReceived;

export type ProtocolAction =
  // only list top level protocol actions
  FundingAction | DefundingAction | ApplicationAction | ConcludingAction;

export function isProtocolAction(action: WalletAction): action is ProtocolAction {
  return (
    isFundingAction(action) ||
    application.isApplicationAction(action) ||
    isConcludingAction(action) ||
    isDefundingAction(action)
  );
}

export interface LoadAction {
  type: typeof LOAD;
  payload: any;
}

export function isLoadAction(action: any): action is LoadAction {
  return action.type && action.type === LOAD;
}

export type LockRequest = LockChannelRequest | UnlockChannelRequest;
export type LockAction = ChannelLocked | ChannelUnlocked;
export function isLockAction(action: WalletAction): action is LockAction {
  return (
    action.type === 'WALLET.LOCKING.CHANNEL_LOCKED' ||
    action.type === 'WALLET.LOCKING.CHANNEL_UNLOCKED'
  );
}
export type WalletAction =
  | AdvanceChannelAction
  | AdjudicatorKnown
  | AdjudicatorEventAction
  | BlockMined
  | DisplayMessageSent
  | LoggedIn
  | MessageSent
  | MetamaskLoadError
  | ProtocolAction
  | protocol.NewProcessAction
  | channel.ChannelAction
  | RelayableAction
  | LockAction
  | LockRequest;
export function isCommonAction(action: WalletAction): action is CommonAction {
  return (
    ['WALLET.COMMON.MESSAGE_RECEIVED', 'WALLET.COMMON.COMMITMENT_RECEIVED'].indexOf(action.type) >=
    0
  );
}

export {
  channel,
  directFunding as funding,
  newLedgerFunding,
  protocol,
  application,
  advanceChannel,
};

// These are any actions that update shared data directly without any protocol
export type SharedDataUpdateAction = AdjudicatorEventAction;

export function isSharedDataUpdateAction(action: WalletAction): action is SharedDataUpdateAction {
  return isAdjudicatorEventAction(action);
}

export function isAdjudicatorEventAction(action: WalletAction): action is AdjudicatorEventAction {
  return (
    action.type === 'WALLET.ADJUDICATOR.CONCLUDED_EVENT' ||
    action.type === 'WALLET.ADJUDICATOR.REFUTED_EVENT' ||
    action.type === 'WALLET.ADJUDICATOR.RESPOND_WITH_MOVE_EVENT' ||
    action.type === 'WALLET.ADJUDICATOR.FUNDING_RECEIVED_EVENT' ||
    action.type === 'WALLET.ADJUDICATOR.CHALLENGE_EXPIRED' ||
    action.type === 'WALLET.ADJUDICATOR.CHALLENGE_CREATED_EVENT' ||
    action.type === 'WALLET.ADJUDICATOR.CHALLENGE_EXPIRY_TIME_SET' ||
    action.type === 'WALLET.ADJUDICATOR.CHANNEL_UPDATE'
  );
}
