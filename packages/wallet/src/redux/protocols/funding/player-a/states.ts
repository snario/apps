import { Properties as P } from '../../../utils';

export type FundingState =
  | WaitForStrategyChoice
  | WaitForStrategyResponse
  | WaitForFunding
  | WaitForPostFundSetup
  | WaitForSuccessConfirmation
  | Success
  | Failure;

export const WAIT_FOR_STRATEGY_CHOICE = 'WaitForStrategyChoice';
export const WAIT_FOR_STRATEGY_RESPONSE = 'WaitForStrategyResponse';
export const WAIT_FOR_FUNDING = 'WaitForFunding';
export const WAIT_FOR_POSTFUND_SETUP = 'WaitForPostFundSetup';
export const WAIT_FOR_SUCCESS_CONFIRMATION = 'WaitForSuccessConfirmation';
export const FAILURE = 'Failure';
export const SUCCESS = 'Success';

export interface WaitForStrategyChoice {
  type: typeof WAIT_FOR_STRATEGY_CHOICE;
  processId: string;
}

export interface WaitForStrategyResponse {
  type: typeof WAIT_FOR_STRATEGY_RESPONSE;
  processId: string;
}

export interface WaitForFunding {
  type: typeof WAIT_FOR_FUNDING;
  processId: string;
  fundingState: 'funding state';
}

export interface WaitForPostFundSetup {
  type: typeof WAIT_FOR_POSTFUND_SETUP;
  processId: string;
}

export interface WaitForSuccessConfirmation {
  type: typeof WAIT_FOR_SUCCESS_CONFIRMATION;
  processId: string;
}

export interface Failure {
  type: typeof FAILURE;
  reason: string;
}

export interface Success {
  type: typeof SUCCESS;
}

// -------
// Helpers
// -------

export function isTerminal(state: FundingState): state is Failure | Success {
  return state.type === FAILURE || state.type === SUCCESS;
}

// ------------
// Constructors
// ------------

export function waitForStrategyChoice(p: P<WaitForStrategyChoice>): WaitForStrategyChoice {
  const { processId } = p;
  return { type: WAIT_FOR_STRATEGY_CHOICE, processId };
}

export function waitForStrategyResponse(p: P<WaitForStrategyResponse>): WaitForStrategyResponse {
  const { processId } = p;
  return { type: WAIT_FOR_STRATEGY_RESPONSE, processId };
}

export function waitForFunding(p: P<WaitForFunding>): WaitForFunding {
  const { processId, fundingState } = p;
  return { type: WAIT_FOR_FUNDING, processId, fundingState };
}

export function waitForPostFundSetup(p: P<WaitForPostFundSetup>): WaitForPostFundSetup {
  const { processId } = p;
  return { type: WAIT_FOR_POSTFUND_SETUP, processId };
}

export function waitForSuccessConfirmation(
  p: P<WaitForSuccessConfirmation>,
): WaitForSuccessConfirmation {
  const { processId } = p;
  return { type: WAIT_FOR_SUCCESS_CONFIRMATION, processId };
}

export function success(): Success {
  return { type: SUCCESS };
}

export function failure(reason: string): Failure {
  return { type: FAILURE, reason };
}
