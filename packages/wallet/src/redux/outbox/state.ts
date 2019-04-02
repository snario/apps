import { TransactionRequest } from 'ethers/providers';
import { WalletEvent, DisplayAction } from 'magmo-wallet-client';
import { WalletProcedure } from '../types';

export const EMPTY_OUTBOX_STATE: OutboxState = {
  displayOutbox: [],
  messageOutbox: [],
  transactionOutbox: [],
};

export interface TransactionOutboxItem {
  transactionRequest: TransactionRequest;
  channelId: string;
  procedure: WalletProcedure;
}
export interface OutboxState {
  displayOutbox: DisplayAction[];
  messageOutbox: WalletEvent[];
  transactionOutbox: TransactionOutboxItem[];
}

export type SideEffects = {
  [Outbox in keyof OutboxState]?: OutboxState[Outbox] | OutboxState[Outbox][0]
};