import { BaseProcessAction } from '../../actions';

export type FundingAction = StrategyProposed | StrategyApproved | StrategyRejected;

export const STRATEGY_CHOSEN = 'WALLET.FUNDING.STRATEGY_CHOSEN';
export const STRATEGY_APPROVED = 'WALLET.FUNDING.STRATEGY_APPROVED';
export const STRATEGY_REJECTED = 'WALLET.FUNDING.STRATEGY_REJECTED';
export const CANCELLED = 'WALLET.FUNDING.CANCELLED';
export const CANCELLED_BY_OPPONENT = 'WALLET.FUNDING.CANCELLED_BY_OPPONENT';

export interface StrategyProposed extends BaseProcessAction {
  type: typeof STRATEGY_CHOSEN;
}

export interface StrategyApproved extends BaseProcessAction {
  type: typeof STRATEGY_APPROVED;
}

export interface StrategyRejected extends BaseProcessAction {
  type: typeof STRATEGY_REJECTED;
}

export interface Cancelled extends BaseProcessAction {
  type: typeof CANCELLED;
}

export interface CancelledByOpponent extends BaseProcessAction {
  type: typeof CANCELLED_BY_OPPONENT;
}

// --------
// Creators
// --------

export const strategyProposed = (processId: string): StrategyProposed => ({
  type: STRATEGY_CHOSEN,
  processId,
});

export const strategyApproved = (processId: string): StrategyApproved => ({
  type: STRATEGY_APPROVED,
  processId,
});

export const strategyRejected = (processId: string): StrategyRejected => ({
  type: STRATEGY_REJECTED,
  processId,
});

export const cancelled = (processId: string): Cancelled => ({
  type: CANCELLED,
  processId,
});

export const cancelledByOpponent = (processId: string): CancelledByOpponent => ({
  type: CANCELLED_BY_OPPONENT,
  processId,
});
